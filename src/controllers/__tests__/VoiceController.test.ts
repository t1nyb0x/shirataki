import "reflect-metadata";
import { VoiceController } from "../VoiceController";
import { container } from "tsyringe";
import { VoiceUseCasePort } from "@/domain/ports/VoiceUseCasePort";
import { VoiceValidator } from "@/application/validations/voiceValidation";
import { ValidationError } from "@/domain/errors/AppError";
import { PhonemeData } from "@/domain/ports/CeVIOServicePort";
import path from "node:path";

// モック用のVoiceUseCase実装
class MockVoiceUseCase implements VoiceUseCasePort {
    setVoiceControl(
        cast: string,
        control: { volume?: number; speed?: number; tone?: number; toneScale?: number; alpha?: number }
    ): void {
        // 何もしない（モック用）
    }
    getEmotionName(cast: string): string[] {
        throw new Error("Method not implemented.");
    }
    textToVoice(cast: string, text: string, path: string): boolean {
        throw new Error("Method not implemented.");
    }
    setEmotions(cast: string, emotions?: { name: string; value: number }[]): void {
        // 何もしない（モック用）
    }
    speak(cast: string, text: string): boolean {
        return true; // モック用の実装
    }
    getTextDuration(cast: string, text: string): number {
        throw new Error("Method not implemented.");
    }
    getPhonemes(cast: string, text: string): PhonemeData[] {
        throw new Error("Method not implemented.");
    }
    getAvailableCasts(): string[] {
        return ["花隈千冬", "弦巻マキ"]; // モック用の実装
    }
}

// モック用のVoiceValidator実装
class MockVoiceValidator extends VoiceValidator {
    constructor() {
        super(new MockVoiceUseCase());
    }

    async validateCast(cast: string): Promise<void> {
        return;
    }

    async validateEmotions(cast: string, emotions?: { name: string; value: number }[]): Promise<void> {
        return;
    }
}

describe("VoiceController", () => {
    let voiceController: VoiceController;
    let mockVoiceUseCase: VoiceUseCasePort;
    let mockVoiceValidator: VoiceValidator;

    beforeEach(() => {
        container.clearInstances();

        // モックの作成と登録
        mockVoiceUseCase = new MockVoiceUseCase();
        mockVoiceValidator = new MockVoiceValidator();

        container.register("VoiceUseCase", {
            useValue: mockVoiceUseCase,
        });
        container.register("VoiceValidator", {
            useValue: mockVoiceValidator,
        });

        voiceController = new VoiceController(mockVoiceUseCase, mockVoiceValidator);
    });

    describe("createVoice", () => {
        it("should return voice file path when successful", async () => {
            jest.spyOn(mockVoiceValidator, "validateCast").mockResolvedValue(undefined);
            jest.spyOn(mockVoiceValidator, "validateEmotions").mockResolvedValue(undefined);
            jest.spyOn(mockVoiceUseCase, "textToVoice").mockReturnValue(true);

            const result = (await voiceController.createVoice({
                cast: "花隈千冬",
                text: "テストメッセージ",
                voiceControl: {},
            })) as { processResult: boolean; outputPath: string };

            expect(result).toBeDefined();
            expect(result.processResult).toBe(true);

            // パス区切りは実行環境に依存するため、セグメントで検証する
            const segments = result.outputPath.split(path.sep);
            expect(segments.at(-1)).toBe("output.wav");
            expect(segments.at(-2)).toMatch(/^[0-9a-f-]{36}$/);
            expect(segments.at(-3)).toBe("tmp");
        });

        it("should set emotions for every request so that previous values are not kept", async () => {
            jest.spyOn(mockVoiceValidator, "validateCast").mockResolvedValue(undefined);
            jest.spyOn(mockVoiceValidator, "validateEmotions").mockResolvedValue(undefined);
            jest.spyOn(mockVoiceUseCase, "textToVoice").mockReturnValue(true);
            jest.spyOn(mockVoiceUseCase, "setEmotions");

            const emotions = [{ name: "哀しみ", value: 90 }];
            await voiceController.createVoice({
                cast: "花隈千冬",
                text: "テストメッセージ",
                voiceControl: {},
                emotions,
            });

            expect(mockVoiceUseCase.setEmotions).toHaveBeenCalledWith("花隈千冬", emotions);
        });

        it("should reset emotions when emotions are not provided", async () => {
            jest.spyOn(mockVoiceValidator, "validateCast").mockResolvedValue(undefined);
            jest.spyOn(mockVoiceValidator, "validateEmotions").mockResolvedValue(undefined);
            jest.spyOn(mockVoiceUseCase, "textToVoice").mockReturnValue(true);
            jest.spyOn(mockVoiceUseCase, "setEmotions");

            await voiceController.createVoice({
                cast: "花隈千冬",
                text: "テストメッセージ",
                voiceControl: {},
            });

            expect(mockVoiceUseCase.setEmotions).toHaveBeenCalledWith("花隈千冬", undefined);
        });

        it("should return error when validation fails", async () => {
            const error = new ValidationError("無効な感情名です");
            jest.spyOn(mockVoiceValidator, "validateEmotions").mockRejectedValue(error);

            const result = await voiceController.createVoice({
                cast: "花隈千冬",
                text: "テストメッセージ",
                voiceControl: {},
                emotions: [{ name: "invalid", value: 50 }],
            });

            expect(result).toEqual({
                error: "無効な感情名です",
                status: 400,
            });
        });
    });

    describe("getEmotionName", () => {
        it("should return emotion names", async () => {
            const mockEmotions = ["happy", "sad"];
            jest.spyOn(mockVoiceUseCase, "getEmotionName").mockReturnValue(mockEmotions);

            const result = await voiceController.getEmotionName("花隈千冬");

            expect(result).toEqual(mockEmotions);
        });
    });

    describe("getTextDuration", () => {
        it("should return the duration", async () => {
            jest.spyOn(mockVoiceValidator, "validateCast").mockResolvedValue(undefined);
            jest.spyOn(mockVoiceUseCase, "getTextDuration").mockReturnValue(1.234);

            const result = await voiceController.getTextDuration("花隈千冬", "こんにちは。");

            expect(result).toBe(1.234);
            expect(mockVoiceUseCase.getTextDuration).toHaveBeenCalledWith("花隈千冬", "こんにちは。");
        });

        it("should return error when the cast is invalid", async () => {
            const error = new ValidationError("無効なキャストです");
            jest.spyOn(mockVoiceValidator, "validateCast").mockRejectedValue(error);

            const result = await voiceController.getTextDuration("存在しないキャスト", "こんにちは。");

            expect(result).toEqual({
                error: "無効なキャストです",
                status: 400,
            });
        });
    });

    describe("getPhonemes", () => {
        it("should return the phonemes", async () => {
            const mockPhonemes = [
                { phoneme: "k", startTime: 0, endTime: 0.05 },
                { phoneme: "o", startTime: 0.05, endTime: 0.12 },
            ];
            jest.spyOn(mockVoiceValidator, "validateCast").mockResolvedValue(undefined);
            jest.spyOn(mockVoiceUseCase, "getPhonemes").mockReturnValue(mockPhonemes);

            const result = await voiceController.getPhonemes("花隈千冬", "こんにちは。");

            expect(result).toEqual(mockPhonemes);
            expect(mockVoiceUseCase.getPhonemes).toHaveBeenCalledWith("花隈千冬", "こんにちは。");
        });

        it("should return error when the cast is invalid", async () => {
            const error = new ValidationError("無効なキャストです");
            jest.spyOn(mockVoiceValidator, "validateCast").mockRejectedValue(error);

            const result = await voiceController.getPhonemes("存在しないキャスト", "こんにちは。");

            expect(result).toEqual({
                error: "無効なキャストです",
                status: 400,
            });
        });
    });

    describe("getAvailableCasts", () => {
        it("should return available casts", () => {
            const mockCasts = ["花隈千冬", "弦巻マキ"];
            jest.spyOn(mockVoiceUseCase, "getAvailableCasts").mockReturnValue(mockCasts);

            const result = voiceController.getAvailableCasts();

            expect(result).toEqual(mockCasts);
        });
    });
});
