import "reflect-metadata";
import { VoiceUseCase } from "../VoiceUseCase";
import { container } from "tsyringe";
import { CeVIOServicePort } from "@/ports/output/CeVIOServicePort";
import { VoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";

// モック用のCeVIOService実装
class MockCeVIOServicePort implements CeVIOServicePort {
    speak(cast: string, text: string): boolean {
        return true; // モック用の実装
    }
    generateWav(cast: string, text: string, path: string): boolean {
        throw new Error("Method not implemented.");
    }
    setParam(
        cast: string,
        params: { volume: number; speed: number; tone: number; toneScale: number; alpha: number }
    ): void {
        // 何もしない（モック用）
    }
    getEmotionName(cast: string): string[] {
        throw new Error("Method not implemented.");
    }
    setEmotion(cast: string, emotionName: string, value: number): void {
        throw new Error("Method not implemented.");
    }
    close(): void {
        throw new Error("Method not implemented.");
    }
    getAvailableCasts(): string[] {
        return ["花隈千冬", "弦巻マキ"]; // モック用の実装
    }
}

describe("VoiceUseCase", () => {
    let voiceUseCase: VoiceUseCasePort;
    let mockCeVIOService: CeVIOServicePort;

    beforeEach(() => {
        container.clearInstances();

        // モックの作成と登録
        mockCeVIOService = new MockCeVIOServicePort();
        container.register("CeVIOService", {
            useValue: mockCeVIOService,
        });

        voiceUseCase = new VoiceUseCase(mockCeVIOService);
    });

    describe("setVoiceControl", () => {
        it("should set default values when options are not provided", () => {
            const cast = "花隈千冬";
            jest.spyOn(mockCeVIOService, "setParam");

            voiceUseCase.setVoiceControl(cast, {});

            expect(mockCeVIOService.setParam).toHaveBeenCalledWith(cast, {
                volume: 50,
                speed: 50,
                tone: 50,
                toneScale: 50,
                alpha: 50,
            });
        });

        it("should override default values with provided options", () => {
            const cast = "花隈千冬";
            jest.spyOn(mockCeVIOService, "setParam");

            voiceUseCase.setVoiceControl(cast, {
                volume: 70,
                speed: 80,
            });

            expect(mockCeVIOService.setParam).toHaveBeenCalledWith(cast, {
                volume: 70,
                speed: 80,
                tone: 50,
                toneScale: 50,
                alpha: 50,
            });
        });
    });

    describe("textToVoice", () => {
        it("should call generateWav with correct parameters", () => {
            const cast = "花隈千冬";
            const text = "テストメッセージ";
            const path = "/path/to/output.wav";
            jest.spyOn(mockCeVIOService, "generateWav").mockReturnValue(true);

            const result = voiceUseCase.textToVoice(cast, text, path);

            expect(result).toBe(true);
            expect(mockCeVIOService.generateWav).toHaveBeenCalledWith(cast, text, path);
        });
    });

    describe("speak", () => {
        it("should call CeVIOService.speak with correct parameters", () => {
            const cast = "花隈千冬";
            const text = "テストメッセージ";
            jest.spyOn(mockCeVIOService, "speak").mockReturnValue(true);

            const result = voiceUseCase.speak(cast, text);

            expect(result).toBe(true);
            expect(mockCeVIOService.speak).toHaveBeenCalledWith(cast, text);
        });
    });

    describe("getEmotionName", () => {
        it("should return emotion names from CeVIOService", () => {
            const cast = "花隈千冬";
            const mockEmotions = ["happy", "sad"];
            jest.spyOn(mockCeVIOService, "getEmotionName").mockReturnValue(mockEmotions);

            const result = voiceUseCase.getEmotionName(cast);

            expect(result).toEqual(mockEmotions);
            expect(mockCeVIOService.getEmotionName).toHaveBeenCalledWith(cast);
        });
    });
});
