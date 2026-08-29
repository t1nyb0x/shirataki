import "reflect-metadata";
import { CeVIOService } from "../CeVIOService";

// winaxはWindows専用のネイティブモジュールのため、読み込みを差し替える
jest.mock("winax", () => ({}), { virtual: true });

interface MockComponent {
    Name: string;
    Value: number;
}

const createMockTalker = () => {
    const components: MockComponent[] = [
        { Name: "嬉しい", Value: 0 },
        { Name: "哀しみ", Value: 0 },
    ];
    const casts = ["花隈千冬", "弦巻マキ"];

    return {
        Cast: "",
        Volume: 0,
        Speed: 0,
        Tone: 0,
        ToneScale: 0,
        Alpha: 0,
        Speak: jest.fn(),
        OutputWaveToFile: jest.fn().mockReturnValue(true),
        GetTextDuration: jest.fn().mockReturnValue(1.234),
        Components: {
            Length: components.length,
            At: jest.fn((index: number) => components[index]),
            ByName: jest.fn((name: string) => {
                const component = components.find((c) => c.Name === name);
                if (!component) throw new Error(`Component not found: ${name}`);
                return component;
            }),
        },
        AvailableCasts: {
            Length: casts.length,
            At: jest.fn((index: number) => casts[index]),
        },
        // 検証用にモック内部の状態を公開する
        _components: components,
    };
};

describe("CeVIOService", () => {
    let mockTalker: ReturnType<typeof createMockTalker>;
    let cevioService: CeVIOService;

    beforeEach(() => {
        mockTalker = createMockTalker();

        (globalThis as any).ActiveXObject = jest.fn((progId: string) =>
            progId.includes("ServiceControl2V40")
                ? { StartHost: jest.fn().mockReturnValue(0), CloseHost: jest.fn() }
                : mockTalker
        );

        cevioService = new CeVIOService();
    });

    afterEach(() => {
        delete (globalThis as any).ActiveXObject;
    });

    describe("setParam", () => {
        it("should set the cast and every voice parameter on the talker", () => {
            const params = { volume: 50, speed: 100, tone: 40, toneScale: 60, alpha: 30 };

            cevioService.setParam("花隈千冬", params);

            expect(mockTalker.Cast).toBe("花隈千冬");
            expect(mockTalker.Volume).toBe(params.volume);
            expect(mockTalker.Speed).toBe(params.speed);
            expect(mockTalker.Tone).toBe(params.tone);
            expect(mockTalker.ToneScale).toBe(params.toneScale);
            expect(mockTalker.Alpha).toBe(params.alpha);
        });

        it("should not set the cast again when it is unchanged", () => {
            const params = { volume: 50, speed: 50, tone: 50, toneScale: 50, alpha: 50 };

            cevioService.setParam("花隈千冬", params);
            mockTalker.Cast = "書き換えられた値";
            cevioService.setParam("花隈千冬", params);

            // 同じキャストなら再設定しないため、書き換えた値がそのまま残る
            expect(mockTalker.Cast).toBe("書き換えられた値");
        });

        it("should set the cast again when it is changed", () => {
            const params = { volume: 50, speed: 50, tone: 50, toneScale: 50, alpha: 50 };

            cevioService.setParam("花隈千冬", params);
            cevioService.setParam("弦巻マキ", params);

            expect(mockTalker.Cast).toBe("弦巻マキ");
        });
    });

    describe("speak", () => {
        it("should wait for the speech to finish and return the result", () => {
            const wait = jest.fn();
            mockTalker.Speak.mockReturnValue({ Wait: wait, IsSucceeded: true });

            const result = cevioService.speak("花隈千冬", "テストメッセージ");

            expect(mockTalker.Speak).toHaveBeenCalledWith("テストメッセージ");
            expect(wait).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it("should return false when the speech fails", () => {
            mockTalker.Speak.mockImplementation(() => {
                throw new Error("COM error");
            });

            expect(cevioService.speak("花隈千冬", "テストメッセージ")).toBe(false);
        });
    });

    describe("generateWav", () => {
        it("should output a wave file and return the result", () => {
            const result = cevioService.generateWav("花隈千冬", "テストメッセージ", "C:\\tmp\\output.wav");

            expect(mockTalker.OutputWaveToFile).toHaveBeenCalledWith("テストメッセージ", "C:\\tmp\\output.wav");
            expect(result).toBe(true);
        });

        it("should return false when the output fails", () => {
            mockTalker.OutputWaveToFile.mockImplementation(() => {
                throw new Error("COM error");
            });

            expect(cevioService.generateWav("花隈千冬", "テストメッセージ", "C:\\tmp\\output.wav")).toBe(false);
        });
    });

    describe("getEmotionName", () => {
        it("should return every component name of the cast", () => {
            expect(cevioService.getEmotionName("花隈千冬")).toEqual(["嬉しい", "哀しみ"]);
        });
    });

    describe("setEmotion", () => {
        it("should set the value of the named component", () => {
            cevioService.setEmotion("花隈千冬", "哀しみ", 90);

            expect(mockTalker._components).toContainEqual({ Name: "哀しみ", Value: 90 });
        });

        it("should throw when the cast does not have the component", () => {
            expect(() => cevioService.setEmotion("花隈千冬", "存在しない感情", 90)).toThrow(
                /Failed to set emotion: 存在しない感情/
            );
        });
    });

    describe("getTextDuration", () => {
        it("should return the duration of the text", () => {
            const result = cevioService.getTextDuration("花隈千冬", "こんにちは。");

            expect(mockTalker.GetTextDuration).toHaveBeenCalledWith("こんにちは。");
            expect(mockTalker.Cast).toBe("花隈千冬");
            expect(result).toBe(1.234);
        });
    });

    describe("getAvailableCasts", () => {
        it("should return every available cast", () => {
            expect(cevioService.getAvailableCasts()).toEqual(["花隈千冬", "弦巻マキ"]);
        });
    });
});
