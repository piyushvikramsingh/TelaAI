import fs from 'fs';
import path from 'path';
import { config } from '../config/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const logLevelMap: Record<string, LogLevel> = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG,
};

class Logger {
  private currentLevel: LogLevel;
  private logFile?: string;

  constructor() {
    this.currentLevel = logLevelMap[config.logging.level] || LogLevel.INFO;
    this.logFile = config.logging.file;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  private writeToFile(message: string): void {
    if (this.logFile) {
      fs.appendFileSync(this.logFile, message + '\n');
    }
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any): void {
    if (level <= this.currentLevel) {
      const formattedMessage = this.formatMessage(levelName, message, meta);
      
      // Console output with colors
      const colorMap = {
        error: '\x1b[31m', // red
        warn: '\x1b[33m',  // yellow
        info: '\x1b[36m',  // cyan
        debug: '\x1b[37m', // white
      };
      
      const reset = '\x1b[0m';
      const color = colorMap[levelName as keyof typeof colorMap] || reset;
      
      console.log(`${color}${formattedMessage}${reset}`);
      
      // File output
      this.writeToFile(formattedMessage);
    }
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, 'error', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, 'warn', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, 'info', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, 'debug', message, meta);
  }
}

export const logger = new Logger();