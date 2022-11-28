import minimist from 'minimist';
import { prompt } from 'enquirer';
import path from 'path';
import semver from 'semver';
import type { IReleaseArgs, IProjectInfo } from './type';
import type { PackageJson } from 'type-fest'
import fse from 'fs-extra';

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
    const packageJsonFilePath = path.join(packagesRootDir, project, 'package.json');
    const packageJson = fse.readJsonSync(packageJsonFilePath) as PackageJson;
    return {
      project,
      packageJson,
      pkgFilePath: packageJsonFilePath
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

const getReleaseTag = async (curVersion: string): Promise<string> => {
  const targetTag = `v${curVersion}`;
  
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

const main = async () => {
  const { project, curVersion = '', selectProjectInfo } = await selectWorkspaceProject();
  const targetVersion = await selectTargetVersion(curVersion);
  const releaseTag = await getReleaseTag(curVersion);
  await updatePackageVersion(targetVersion, selectProjectInfo!);
  console.log(project, targetVersion, releaseTag)
}

main();