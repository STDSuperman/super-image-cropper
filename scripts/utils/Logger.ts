import consola from 'consola';

export class Logger {
  protected constructor() {}

  public static log(message: string, ...args: any[]): void {
    consola.log(message, ...args);
  }

  public static info(message: string, ...args: any[]): void {
    consola.info(message, ...args);
  }

  public static warn(message: string, ...args: any[]): void {
    consola.warn(message, ...args);
  }

  public static error(message: string, ...args: any[]): void {
    consola.error(message, ...args);
  }
}