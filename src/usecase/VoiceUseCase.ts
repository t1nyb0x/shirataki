import { CeVIOServicePort } from "@/ports/CeVIOServicePort";
import { VoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { inject, injectable } from "tsyringe";

@injectable()
export class VoiceUseCase implements VoiceUseCasePort {
    constructor(@inject("CeVIOService") private cevioService: CeVIOServicePort) {}

    textToVoice(cast: string, text: string, path: string): boolean {
        return this.cevioService.generateWav(cast, text, path);
    }
}
