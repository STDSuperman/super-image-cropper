import * as execa from 'execa';
import type { ExecaReturnValue, Options } from 'execa';

export class ExecaCommand {
  public static async runCommand(cmd: string, options: Options):Promise<ExecaReturnValue> {
    const task =  execa.execaCommand(cmd, options);
    task.stderr?.pipe(process.stderr);
    task.stdin?.pipe(process.stdin);
    task.stdout?.pipe(process.stdout);
    return task;
  }
} 