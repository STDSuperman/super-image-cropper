import minimist from 'minimist';
import { prompt } from 'enquirer';
import path from 'path';
import semver from 'semver';
import type { IReleaseArgs, IProjectInfo } from './type';
import type { PackageJson } from 'type-fest'
import fse from 'fs-extra';
import { ExecaCommand } from '../utils/ExecCommand'
import { Logger } from '../utils/Logger';
import chalk from 'chalk';

const args = minimist(process.argv.slice(2)) as unknown as IReleaseArgs;

export const enum ReleaseType {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
}

export const RELEASE_TYPES: ReleaseType[] = [
  ReleaseType.MAJOR,
  ReleaseType.MINOR,
  ReleaseType.PATCH,
];

const selectWorkspaceProject = async () => {
  const workspaceProjectsInfo = readWorkspaceProjectsInfo();
  const { project }: Record<'project', string> = await prompt({
    type: 'select',
    name: 'project',
    message: 'Select project',
    choices: workspaceProjectsInfo.map(info => info.project)
  });

  const selectProjectInfo = workspaceProjectsInfo.find(item => item.project === project);

  if (!selectProjectInfo) {
    Logger.log('Target project not found');
    process.exit(0);
  }

  return {
    project,
    curVersion: selectProjectInfo?.packageJson.version,
    selectProjectInfo
  };
}

const readWorkspaceProjectsInfo = (): IProjectInfo[] => {
  const packagesRootDir = path.resolve(__dirname, '../../packages');
  const projects = fse.readdirSync(packagesRootDir);
  return projects.map(project => {
    const packageRoot = path.join(packagesRootDir, project);
    const packageJsonFilePath = path.join(packagesRootDir, project, 'package.json');
    const packageJson = fse.readJsonSync(packageJsonFilePath) as PackageJson;
    return {
      project,
      packageJson,
      pkgFilePath: packageJsonFilePath,
      packageRoot
    }
  })
}

const getBetaVersion = (curVersion: string): string => {
  const betaKey = '-beta.'
  const isBeta = curVersion.includes(betaKey);
  let targetVersion = '';

  if (isBeta) {
    const preVersion = +curVersion.split(betaKey)[1];
    targetVersion = curVersion.replace(/(-beta.)\d+/, `$1${preVersion + 1}`)
  } else {
    targetVersion = `${semver.inc(curVersion, ReleaseType.PATCH)}-beta.0`
  }
  
  return targetVersion;
}

const getCustomVersion = async (): Promise<string> => {
  const { customVersion }: Record<'customVersion', string> = await prompt({
    type: 'input',
    name: 'customVersion',
    message: 'Input custom version'
  })

  return `custom (${customVersion})`;
}

const selectTargetVersion = async (curVersion: string): Promise<string> => {
  let { version }: Record<'version', string> = await prompt({
    type: 'select',
    name: 'version',
    message: 'Select release type',
    choices: RELEASE_TYPES
      .map(type => `${type} (${semver.inc(curVersion, type)})`)
      .concat(
        `beta (${getBetaVersion(curVersion)})`,
        'custom'
      )
  })

  if (version === 'custom') {
    const customVersion = await getCustomVersion();
    version = customVersion || version;
  }

  const releaseVersion = version?.match(/\((.*)\)/)?.[1] ?? '';

  if (semver.valid(releaseVersion)) {
    return releaseVersion;
  } else {
    throw new Error('Invalid Release Version');
  }
}

const getReleaseTag = async (project, curVersion: string): Promise<string> => {
  const targetTag = `${project}@${curVersion}`;
  
  const { confirm }: Record<'confirm', string> = await prompt({
    type: 'confirm',
    name: 'confirm',
    message: `Release ${chalk.cyan(targetTag)}. Confirm?`,
    initial: true,
  })

  if (confirm) return targetTag;
  Logger.warn('Cancel release.')
  process.exit(0);
}

const updatePackageVersion = async (
  newVersion: string,
  selectProjectInfo: IProjectInfo
): Promise<void> => {
  const { pkgFilePath, packageJson } = selectProjectInfo;
  packageJson.version = newVersion;
  fse.writeFileSync(pkgFilePath, JSON.stringify(packageJson, null, 2));
}

const execBuildScript = async () => {
  const task = ExecaCommand.runCommand('pnpm build', {
    cwd: process.cwd(),
  })

  return task;
}

const checkGitDiffAndCommit = async (
  project: string,
  releaseTag: string,
) => {
  const { stdout } = await ExecaCommand.runCommand('git diff', {
    cwd: process.cwd(),
  })
  
  if (!stdout) {
    Logger.warn('No commit changes found');
    const { confirm }: Record<'confirm', string> = await prompt({
      type: 'confirm',
      name: 'confirm',
      message: `No commit changes found. Continue publish?`,
      initial: true,
    })
    !confirm && process.exit(0);
  }

  const { confirm }: Record<'confirm', string> = await prompt({
    type: 'confirm',
    name: 'confirm',
    message: `Will save to git. Confirm?`,
    initial: true,
  })

  if (!confirm) {
    Logger.warn('Skip git actions.');
    return;
  }

  await ExecaCommand.runCommand('git add --all', {
    cwd: process.cwd(),
  })
  await ExecaCommand.runCommand(`pnpx git-cz --type=release --scope=${project} --subject=Release:(${releaseTag}) --non-interactive`, {
    cwd: process.cwd(),
  });
}

const pushTagAndCommit = async (releaseTag: string) => {
  await ExecaCommand.runCommand(`git tag ${releaseTag}`, { cwd: process.cwd() });
  await ExecaCommand.runCommand(`git push origin refs/tags/${releaseTag} --verbose --progress`, { cwd: process.cwd() });
  await ExecaCommand.runCommand('git push', {
    cwd: process.cwd(),
  })
}

const publishPackage = async (selectProjectInfo: IProjectInfo, publishTag: string) => {
  const { confirm }: Record<'confirm', string> = await prompt({
    type: 'confirm',
    name: 'confirm',
    message: `Will publish package. Confirm?`,
    initial: true,
  })

  if (!confirm) {
    Logger.warn('Do not publish package');
    process.exit(0);
  }
  
  const publishArgs = [
    'publish',
    '--registry=https://registry.npmjs.org/',
    '--access=public',
    '--no-git-checks',
    `--tag ${publishTag}`,
  ]

  await ExecaCommand.runCommand(`pnpm ${publishArgs.join(' ')}`, { cwd: selectProjectInfo.packageRoot })
}

const doLint = async () => {
  await ExecaCommand.runCommand('pnpm lint:fix', { cwd: process.cwd() });
}

const main = async () => {
  const { project, curVersion = '', selectProjectInfo } = await selectWorkspaceProject();
  const targetVersion = await selectTargetVersion(curVersion);
  const releaseTag = await getReleaseTag(project, targetVersion);
  await updatePackageVersion(targetVersion, selectProjectInfo);
  await execBuildScript();
  await doLint();
  await checkGitDiffAndCommit(project, releaseTag);
  await pushTagAndCommit(releaseTag);

  const publishTag = releaseTag.includes('beta') ? 'beta' : 'latest';
  await publishPackage(selectProjectInfo, publishTag);
  Logger.log(project, targetVersion, releaseTag)
}

main();