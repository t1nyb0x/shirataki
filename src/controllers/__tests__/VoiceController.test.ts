import "reflect-metadata";
import { VoiceController } from "../VoiceController";
import { container } from "tsyringe";
import { VoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { VoiceValidator } from "@/validations/voiceValidation";
import { ValidationError } from "@/errors/AppError";

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
    setEmotion(cast: string, emotionName: string, value: number): void {
        throw new Error("Method not implemented.");
    }
    speak(cast: string, text: string): boolean {
        return true; // モック用の実装
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
            expect(result.outputPath).toMatch(/[\\/]tmp\\[0-9a-f-]+\\output\.wav$/);
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
        it("should return emotion names", () => {
            const mockEmotions = ["happy", "sad"];
            jest.spyOn(mockVoiceUseCase, "getEmotionName").mockReturnValue(mockEmotions);

            const result = voiceController.getEmotionName("花隈千冬");

            expect(result).toEqual(mockEmotions);
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
