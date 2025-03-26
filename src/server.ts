import "reflect-metadata";
import express from "express";
import axios from "axios";
import { compareVersions } from "compare-versions";
import routesV1 from "@/routes/v1/api";
import "@/DIContainer";
import "@/config/log4js";
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

const app = express();
const port = process.env.PORT ?? 3000;

// 起動時にバージョンチェックを実行
checkForUpdates();

app.use(express.json());

app.use("/v1", routesV1);

app.listen(port, () => {
    console.log(`Launched Shirataki server http://localhost:${port}`);
});
