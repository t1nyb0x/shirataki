import "reflect-metadata";
import { CeVIOService } from "../CeVIOService";

// winaxはWindows専用のネイティブモジュールのため、読み込みを差し替える
jest.mock("winax", () => ({}), { virtual: true });

describe("CeVIOService ホストの起動と終了", () => {
    let mockService: { StartHost: jest.Mock; CloseHost: jest.Mock };

    beforeEach(() => {
        mockService = {
            StartHost: jest.fn().mockReturnValue(0),
            CloseHost: jest.fn(),
        };

        (globalThis as any).ActiveXObject = jest.fn((progId: string) =>
            progId.includes("ServiceControl2V40") ? mockService : {}
        );
    });

    afterEach(() => {
        delete (globalThis as any).ActiveXObject;
    });

    describe("constructor", () => {
        it("should start the host and wait until it is accessible", () => {
            new CeVIOService();

            // noWait = false で、アクセス可能になるまで待つ
            expect(mockService.StartHost).toHaveBeenCalledWith(false);
        });

        it("should not throw when StartHost returns 0", () => {
            mockService.StartHost.mockReturnValue(0);

            expect(() => new CeVIOService()).not.toThrow();
        });

        it("should throw with the documented reason when StartHost fails", () => {
            mockService.StartHost.mockReturnValue(-2);

            expect(() => new CeVIOService()).toThrow(/実行ファイルが見つかりません/);
        });

        it.each([
            [-1, /インストール状態が不明です/],
            [-2, /実行ファイルが見つかりません/],
            [-3, /プロセスの起動に失敗しました/],
            [-4, /エラーにより終了しました/],
        ])("should throw for error code %i", (code, expected) => {
            mockService.StartHost.mockReturnValue(code);

            expect(() => new CeVIOService()).toThrow(expected);
        });

        it("should throw with the code when StartHost returns an unknown value", () => {
            mockService.StartHost.mockReturnValue(-99);

            expect(() => new CeVIOService()).toThrow(/-99/);
        });
    });

    describe("close", () => {
        it("should request CeVIO AI to close", () => {
            const cevioService = new CeVIOService();

            cevioService.close();

            // mode 0: 編集中の場合、保存や終了キャンセルが可能
            expect(mockService.CloseHost).toHaveBeenCalledWith(0);
        });
    });
});
