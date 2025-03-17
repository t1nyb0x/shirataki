import { CeVIOServicePort } from "@/ports/CeVIOServicePort";
import { SampleVoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { inject, injectable } from "tsyringe";

@injectable()
export class SampleVoiceUseCase implements SampleVoiceUseCasePort {
    constructor(@inject("CeVIOService") private cevioService: CeVIOServicePort) {}

    textToVoice(cast: string, text: string, path: string): boolean {
        return this.cevioService.generateWav(cast, text, path);
    }
}
