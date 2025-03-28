import { VoiceController } from "@/controllers/VoiceController";
import { Router, Request, Response } from "express";
import { container } from "tsyringe";
import fs from "fs";
import path from "path";
import { ExportType } from "@/constants";
import { logger } from "@/config/log4js";

const router = Router();

router.post("/voice/sample", async (req: Request, res: Response): Promise<any> => {
    try {
        const voiceController = container.resolve(VoiceController);
        const response = await voiceController.createVoice({
            cast: req.body.cast,
            text: `こんにちは、${req.body.cast}です。`,
            voiceControl: {},
        });

        if (!response?.outputPath) {
            return res.status(500).send({ error: "出力生成に失敗しました" });
        }

        if (req.body.exportType === ExportType.FILE || req.body.exportType === undefined) {
            res.status(200).send(response);
        } else if (req.body.exportType === ExportType.STREAM) {
            const file = path.resolve(response.outputPath);

            res.setHeader("Content-Type", "audio/wav");
            const fileStream = fs.createReadStream(file);

            fileStream.on("error", (err) => {
                console.error("エラー:", err.message);
                response.cleanup?.().catch(console.error);
            });

            fileStream.on("end", () => {
                response.cleanup?.().catch(console.error);
            });

            fileStream.pipe(res);
        } else {
            logger.error("exportTypeの値が不正です。（使用可能な値　0: file出力, 1: stream出力）");
            res.status(400).send({ error: "exportTypeの値が不正です。（使用可能な値　0: file出力, 1: stream出力）" });
        }
    } catch (error) {
        console.error("サンプル音声生成エラー:", error);
        res.status(500).send({ error: "サンプル音声生成に失敗しました" });
    }
});

router.post("/voice/create", async (req: Request, res: Response): Promise<any> => {
    const voiceController = container.resolve(VoiceController);
    const response = await voiceController.createVoice(req.body);
    if (response?.error) {
        return res.status(400).send({ error: response.error });
    }
    if (!response?.outputPath) {
        return res.status(500).send({ error: "出力生成に失敗しました" });
    }
    if (req.body.exportType === ExportType.FILE || req.body.exportType === undefined) {
        res.status(200).send(response);
    } else if (req.body.exportType === ExportType.STREAM) {
        const file = path.resolve(response.outputPath);

        res.setHeader("Content-Type", "audio/wav");
        const fileStream = fs.createReadStream(file);

        fileStream.on("error", (err) => {
            console.error("エラー:", err.message);
            response.cleanup?.().catch(console.error);
        });

        fileStream.on("end", () => {
            response.cleanup?.().catch(console.error);
        });

        fileStream.pipe(res);
    } else {
        logger.error("exportTypeの値が不正です。（使用可能な値　0: file出力, 1: stream出力）");
        res.status(400).send({ error: "exportTypeの値が不正です。（使用可能な値　0: file出力, 1: stream出力）" });
    }
});

router.get("/voice/emotions", async (req: Request, res: Response): Promise<void> => {
    try {
        const voiceController = container.resolve(VoiceController);
        if (!req.query.cast) {
            res.status(400).send({ error: "キャスト名をクエリに入力してください" });
            return;
        }
        const cast = req.query.cast as string;
        const response = await voiceController.getEmotionName(cast);

        if (typeof response === "object" && "error" in response) {
            res.status(400).send({ error: response.error });
            return;
        }

        res.status(200).send(response);
    } catch (error) {
        console.error("感情リスト取得エラー:", error);
        res.status(500).send({ error: "感情リストの取得に失敗しました" });
    }
});

router.get("/voice/casts", (req: Request, res: Response): void => {
    const voiceController = container.resolve(VoiceController);
    const response = voiceController.getAvailableCasts();
    res.status(200).send(response);
});
export default router;
