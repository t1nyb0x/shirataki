import { VoiceUseCasePort } from "@/domain/ports/VoiceUseCasePort";
import path from "node:path";
import { inject, injectable } from "tsyringe";
import { randomUUID } from "node:crypto";
import fs from "fs/promises";
import { VoiceValidator } from "@/application/validations/voiceValidation";
import { ValidationError } from "@/domain/errors/AppError";
import { logger } from "@/config/log4js";
import { PhonemeData } from "@/domain/ports/CeVIOServicePort";

@injectable()
export class VoiceController {
    constructor(
        @inject("VoiceUseCase") private voiceUseCase: VoiceUseCasePort,
        @inject("VoiceValidator") private voiceValidator: VoiceValidator
    ) {}

    async createVoice(body: {
        cast: string;
        text: string;
        voiceControl: { volume?: number; speed?: number; tone?: number; toneScale?: number; alpha?: number };
        emotions?: { name: string; value: number }[];
    }) {
        try {
            // キャストのバリデーション
            await this.voiceValidator.validateCast(body.cast);
            // 感情パラメータのバリデーション
            await this.voiceValidator.validateEmotions(body.cast, body.emotions);
        } catch (error) {
            if (error instanceof ValidationError) {
                return {
                    error: error.message,
                    status: 400,
                };
            }
            throw error;
        }
        const exportDir = process.env.OUTPUT_PATH ?? path.join(__dirname, "..", "..", "tmp");
        const exportPath = path.join(exportDir, randomUUID());

        try {
            await fs.mkdir(exportPath, { recursive: true });
            // 音声の調節を行う
            this.voiceUseCase.setVoiceControl(body.cast, body.voiceControl);

            // 感情パラメータを設定（未指定の成分は0で打ち消される）
            this.voiceUseCase.setEmotions(body.cast, body.emotions);

            // テキストから音声を作成
            const outputPath = path.join(exportPath, "output.wav");
            const response = this.voiceUseCase.textToVoice(body.cast, body.text, outputPath);

            // ストリーム送信後にファイルを削除
            const cleanup = async () => {
                try {
                    await fs.rm(exportPath, { recursive: true, force: true });
                    logger.info(`${exportPath}を削除しました`);
                } catch (err) {
                    console.error("ファイル削除に失敗しました:", err);
                }
            };

            return {
                processResult: response,
                outputPath: outputPath,
                cleanup, // クリーンアップ関数を返す
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getEmotionName(cast: string): Promise<string[] | { error: string; status: number }> {
        // キャストのバリデーション
        try {
            await this.voiceValidator.validateCast(cast);
        } catch (error) {
            if (error instanceof ValidationError) {
                return {
                    error: error.message,
                    status: 400,
                };
            }
            throw error;
        }
        return this.voiceUseCase.getEmotionName(cast);
    }

    async getTextDuration(cast: string, text: string): Promise<number | { error: string; status: number }> {
        // キャストのバリデーション
        try {
            await this.voiceValidator.validateCast(cast);
        } catch (error) {
            if (error instanceof ValidationError) {
                return {
                    error: error.message,
                    status: 400,
                };
            }
            throw error;
        }
        return this.voiceUseCase.getTextDuration(cast, text);
    }

    async getPhonemes(cast: string, text: string): Promise<PhonemeData[] | { error: string; status: number }> {
        // キャストのバリデーション
        try {
            await this.voiceValidator.validateCast(cast);
        } catch (error) {
            if (error instanceof ValidationError) {
                return {
                    error: error.message,
                    status: 400,
                };
            }
            throw error;
        }
        return this.voiceUseCase.getPhonemes(cast, text);
    }

    getAvailableCasts(): string[] {
        return this.voiceUseCase.getAvailableCasts();
    }
}
