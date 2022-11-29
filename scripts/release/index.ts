import minimist from 'minimist';
import { prompt } from 'enquirer';
import path from 'path';
import semver from 'semver';
import type { IReleaseArgs, IProjectInfo } from './type';
import type { PackageJson } from 'type-fest'
import fse from 'fs-extra';
import execa from 'execa';
import { ExecaCommand } from '../utils/ExecCommand'

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
    console.log('Target project not found');
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
    const preVersion = curVersion.split(betaKey)[1];
    targetVersion = curVersion.replace(/(-beta.)\d+/, `$1${preVersion + 1}`)
  } else {
    targetVersion = `${curVersion}-beta.0`
  }
  
  return targetVersion;
}

const selectTargetVersion = async (curVersion: string): Promise<string> => {
  const { version }: Record<'version', string> = await prompt({
    type: 'select',
    name: 'version',
    message: 'Select release type',
    choices: RELEASE_TYPES
      .map(type => `${type} (${semver.inc(curVersion, type)})`)
      .concat(`beta (${getBetaVersion(curVersion)})`)
  })
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
    message: `Release ${targetTag}. Confirm?`,
    initial: true,
  })

  if (confirm) return targetTag;
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
    console.warn('No commit changes found');
    process.exit(0);
  }

  await ExecaCommand.runCommand('git add --all', {
    cwd: process.cwd(),
  })
  await ExecaCommand.runCommand(`pnpx git-cz --type=release --scope=${project} --subject=Release ${releaseTag} --non-interactive`, {
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
  const publishArgs = [
    'publish',
    '--registry=https://registry.npmjs.org/',
    '--access=public',
    '--no-git-checks',
    `--tag ${publishTag}`,
  ]

  await ExecaCommand.runCommand(`pnpm ${publishArgs.join(' ')}`, { cwd: selectProjectInfo.packageRoot })
}

const main = async () => {
  const { project, curVersion = '', selectProjectInfo } = await selectWorkspaceProject();
  const targetVersion = await selectTargetVersion(curVersion);
  const releaseTag = await getReleaseTag(project, curVersion);
  await updatePackageVersion(targetVersion, selectProjectInfo);
  await execBuildScript();
  await checkGitDiffAndCommit(project, releaseTag)
  await pushTagAndCommit(releaseTag);

  const publishTag = releaseTag.includes('beta') ? 'beta' : 'latest';

  await publishPackage(selectProjectInfo, publishTag);
  console.log(project, targetVersion, releaseTag)
}

main();