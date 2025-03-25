import log4js from "log4js";
import path from "path";

const logDir = process.env.LOG_DIR || path.join(__dirname, "../../logs");

log4js.configure({
    appenders: {
        console: { type: "console" },
        file: {
            type: "file",
            filename: path.join(logDir, "app.log"),
            maxLogSize: 10485760, // 10MB
            backups: 5,
            compress: true,
        },
        errorFile: {
            type: "file",
            filename: path.join(logDir, "errors.log"),
        },
        errors: {
            type: "logLevelFilter",
            level: "error",
            appender: "errorFile",
        },
    },
    categories: {
        default: {
            appenders: ["console", "file", "errors"],
            level: "info",
        },
    },
});

export const logger = log4js.getLogger();
export const getLogger = (name: string) => log4js.getLogger(name);
