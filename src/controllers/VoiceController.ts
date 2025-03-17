import { VoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { inject, injectable } from "tsyringe";

@injectable()
export class VoiceController {
    constructor(@inject("VoiceUseCase") private VoiceUseCase: VoiceUseCasePort) {}

    createVoice() {
        const cast = "花隈千冬";
        const text = `こんにちは、${cast}です`;
        const path = process.env.OUTPUT_PATH!;
        return this.VoiceUseCase.textToVoice(cast, text, path + "\\output.wav");
    }
}
