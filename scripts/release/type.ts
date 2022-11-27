import type { PackageJson } from 'type-fest'

export interface IReleaseArgs {
  dry: boolean;
}

export interface IProjectInfo {
  project: string;
  packageJson: PackageJson;
}