import { SampleVoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { inject, injectable } from "tsyringe";

@injectable()
export class VoiceController {
    constructor(@inject("SampleVoiceUseCase") private sampleVoiceUseCase: SampleVoiceUseCasePort) {}

    createSampleVoice() {
        const cast = "花隈千冬";
        const text = `こんにちは、${cast}です`;
        const path = process.env.OUTPUT_PATH!;
        return this.sampleVoiceUseCase.textToVoice(cast, text, path + "\\output.wav");
    }
}
