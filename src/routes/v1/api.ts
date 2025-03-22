import { VoiceController } from "@/controllers/VoiceController";
import { Router, Request, Response } from "express";
import { container } from "tsyringe";
import fs from "fs";
import path from "path";

const router = Router();

router.post("/voice/sample", (req: Request, res: Response): any => {
    const voiceController = container.resolve(VoiceController);
    const response = voiceController.createVoice({ cast: req.body.cast, text: `こんにちは、${req.body.cast}です。` });
    return res.status(200).send(response);
});

router.post("/voice/create", async (req: Request, res: Response): Promise<any> => {
    const voiceController = container.resolve(VoiceController);
    const response = await voiceController.createVoice(req.body);
    const file = path.resolve(response!.outputPath);

    res.setHeader("Content-Type", "audio/wav");
    const fileStream = fs.createReadStream(file);

    fileStream.on("error", (err) => {
        console.error("エラー:", err.message);
    });
    fileStream.pipe(res);
    // TODO: wav出力とストリーム返却とで分ける
    // return res.status(200).send(response);
});

router.get("/voice/emotionName", (req: Request, res: Response): any => {
    const voiceController = container.resolve(VoiceController);
    if (!req.query.cast) return res.status(400).send("キャスト名をクエリに入力してください");
    const cast = req.query.cast as string;
    const response = voiceController.getEmotionName(cast);
    return res.status(200).send(response);
});
export default router;
