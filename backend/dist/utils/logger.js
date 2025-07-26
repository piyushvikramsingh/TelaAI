"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const environment_1 = require("../config/environment");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
const logLevelMap = {
    error: LogLevel.ERROR,
    warn: LogLevel.WARN,
    info: LogLevel.INFO,
    debug: LogLevel.DEBUG,
};
class Logger {
    constructor() {
        this.currentLevel = logLevelMap[environment_1.config.logging.level] || LogLevel.INFO;
        this.logFile = environment_1.config.logging.file;
        this.ensureLogDirectory();
    }
    ensureLogDirectory() {
        if (this.logFile) {
            const logDir = path_1.default.dirname(this.logFile);
            if (!fs_1.default.existsSync(logDir)) {
                fs_1.default.mkdirSync(logDir, { recursive: true });
            }
        }
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }
    writeToFile(message) {
        if (this.logFile) {
            fs_1.default.appendFileSync(this.logFile, message + '\n');
        }
    }
    log(level, levelName, message, meta) {
        if (level <= this.currentLevel) {
            const formattedMessage = this.formatMessage(levelName, message, meta);
            // Console output with colors
            const colorMap = {
                error: '\x1b[31m', // red
                warn: '\x1b[33m', // yellow
                info: '\x1b[36m', // cyan
                debug: '\x1b[37m', // white
            };
            const reset = '\x1b[0m';
            const color = colorMap[levelName] || reset;
            console.log(`${color}${formattedMessage}${reset}`);
            // File output
            this.writeToFile(formattedMessage);
        }
    }
    error(message, meta) {
        this.log(LogLevel.ERROR, 'error', message, meta);
    }
    warn(message, meta) {
        this.log(LogLevel.WARN, 'warn', message, meta);
    }
    info(message, meta) {
        this.log(LogLevel.INFO, 'info', message, meta);
    }
    debug(message, meta) {
        this.log(LogLevel.DEBUG, 'debug', message, meta);
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map