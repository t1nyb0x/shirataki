import { VoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import path from "node:path";
import { inject, injectable } from "tsyringe";
import { randomUUID } from "node:crypto";
import fs from "fs/promises";

@injectable()
export class VoiceController {
    constructor(@inject("VoiceUseCase") private VoiceUseCase: VoiceUseCasePort) {}

    async createVoice(body: { cast: string; text: string }) {
        const exportDir = process.env.OUTPUT_PATH ?? path.join(__dirname, "..", "..", "tmp");
        const exportPath = exportDir + "\\" + randomUUID();

        try {
            await fs.mkdir(exportPath, { recursive: true });
            // this.VoiceUseCase.setVoiceControl(body.voiceControl);
            const response = this.VoiceUseCase.textToVoice(body.cast, body.text, exportPath + "\\output.wav");
            return {
                processResult: response,
                outputPath: exportPath + "\\output.wav",
            };
        } catch (error) {
            console.error(error);
        }
    }

    getEmotionName(cast: string): string[] {
        return this.VoiceUseCase.getEmotionName(cast);
    }
}
