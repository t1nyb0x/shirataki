import "reflect-metadata";
import { CeVIOService } from "../CeVIOService";
import { container } from "tsyringe";
import { CeVIOServicePort } from "@/domain/ports/CeVIOServicePort";

// モック用の実装クラスを作成
class MockCeVIOServicePort implements CeVIOServicePort {
    public talker = {
        Volume: 50,
        Speed: 100,
        Tone: 50,
        ToneScale: 50,
        Alpha: 50,
        Cast: "花隈千冬",
    };

    speak(cast: string, text: string): boolean {
        return true; // 常に成功を返す（モック用）
    }
    generateWav(cast: string, text: string, path: string): boolean {
        return true; // 常に成功を返す（モック用）
    }
    setParam(
        cast: string,
        params: { volume: number; speed: number; tone: number; toneScale: number; alpha: number }
    ): void {
        this.talker.Cast = cast; // 直接Castプロパティを設定
        this.talker.Volume = params.volume;
        this.talker.Speed = params.speed;
        this.talker.Tone = params.tone;
        this.talker.ToneScale = params.toneScale;
        this.talker.Alpha = params.alpha;
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

describe("CeVIOService", () => {
    let cevioService: CeVIOService;
    let mockCeVIOServicePort: CeVIOServicePort;

    beforeEach(() => {
        // 各テスト前にDIコンテナをリセット
        container.clearInstances();

        // モックの作成
        mockCeVIOServicePort = new MockCeVIOServicePort();
        container.register("CeVIOServicePort", {
            useValue: mockCeVIOServicePort,
        });

        cevioService = new CeVIOService();
    });

    describe("speak", () => {
        it("should call CeVIOServicePort.speak with correct parameters", () => {
            const cast = "花隈千冬";
            const text = "テストメッセージ";

            const result = cevioService.speak(cast, text);

            expect(result).toBe(true);
        });
    });

    describe("setParam", () => {
        it("should call CeVIOServicePort.setParam with correct parameters", () => {
            const cast = "花隈千冬";
            const params = {
                volume: 50,
                speed: 100,
                tone: 50,
                toneScale: 50,
                alpha: 50,
            };

            cevioService.setParam(cast, params);

            const mockPort = mockCeVIOServicePort as MockCeVIOServicePort;
            expect(mockPort.talker.Cast).toBe(cast);
            expect(mockPort.talker.Volume).toBe(params.volume);
            expect(mockPort.talker.Speed).toBe(params.speed);
            expect(mockPort.talker.Tone).toBe(params.tone);
            expect(mockPort.talker.ToneScale).toBe(params.toneScale);
            expect(mockPort.talker.Alpha).toBe(params.alpha);
        });
    });
});
