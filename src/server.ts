import "reflect-metadata";
import express from "express";
import axios from "axios";
import { compareVersions } from "compare-versions";
import routesV1 from "@/routes/v1/api";
import "@/DIContainer";
import { logger } from "@/config/log4js";
import { container } from "tsyringe";
import { CeVIOServicePort } from "@/domain/ports/CeVIOServicePort";
import packageJson from "../package.json";

async function checkForUpdates() {
    try {
        const response = await axios.get("https://api.github.com/repos/t1nyb0x/shirataki/releases/latest", {
            validateStatus: (status) => status < 400 || status === 404,
        });

        // リリースが存在しない場合は何もしない
        if (response.status === 404) return;

        const latestVersion = response.data.tag_name.replace(/^v/, "");
        const currentVersion = packageJson.version;

        // 新しいバージョンのみ通知
        if (compareVersions(latestVersion, currentVersion) > 0) {
            console.log(`\n⚠️ 新しいバージョンが利用可能です: v${latestVersion}`);
            console.log(`現在のバージョン: v${currentVersion}`);
            console.log(`更新内容: ${response.data.body}`);
            console.log(`ダウンロード: ${response.data.html_url}\n`);
        }
    } catch (error: unknown) {
        // 404以外のエラーのみ表示
        if (error instanceof Error && !error.message.includes("404")) {
            console.error("バージョンチェックに失敗しました:", error.message);
        }
    }
}

/**
 * CeVIO AIへの接続を起動時に確認する。
 * 接続できない場合はリクエストを受けても処理できないため、起動を中断する。
 */
function resolveCeVIOService(): CeVIOServicePort {
    try {
        return container.resolve<CeVIOServicePort>("CeVIOService");
    } catch (error) {
        logger.error(
            `CeVIO AIに接続できないため、サーバーを起動できません: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
    }
}

const app = express();
const host = process.env.HOST ?? "0.0.0.0";
const port = (process.env.PORT as unknown as number) ?? 3000;

// 起動時にバージョンチェックを実行
checkForUpdates();

app.use(express.json());

app.use("/v1", routesV1);

const cevioService = resolveCeVIOService();

const server = app.listen(port, host, () => {
    console.log(`Launched Shirataki server http://${host}:${port}`);
});

let isShuttingDown = false;

// 終了時にCeVIO AIへ終了を要求する
function shutdown(signal: NodeJS.Signals) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`${signal}を受信しました。サーバーを終了します`);
    server.close(() => {
        try {
            cevioService.close();
        } catch (error) {
            logger.error(`CeVIO AIの終了要求に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
        }
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
