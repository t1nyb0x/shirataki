import { getLogger } from "@/config/log4js";

export abstract class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly logger = getLogger(this.constructor.name);

    constructor(message: string, statusCode: number, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // エラーログ出力 (メッセージのみ)
        this.logger.error(this.message);

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = "Internal Server Error") {
        super(message, 500);
    }
}
