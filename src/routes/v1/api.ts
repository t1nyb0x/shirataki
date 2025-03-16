import { VoiceController } from "@/controllers/VoiceController";
import { Router, Request, Response } from "express";
import { container } from "tsyringe";

const router = Router();

// `GET /api/hello` エンドポイント
router.get("/hello", (_req: Request, res: Response) => {
    res.json({ message: "こんにちは、鹿さん！🎤 TypeScriptでAPI作ったよ！" });
});

router.get("/sample", (_req: Request, res: Response): any => {
    const voiceController = container.resolve(VoiceController);
    const response = voiceController.createSampleVoice();
    return res.status(200).send(response);
});
export default router;
