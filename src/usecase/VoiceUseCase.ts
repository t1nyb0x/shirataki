import { CeVIOServicePort } from "@/ports/CeVIOServicePort";
import { VoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { inject, injectable } from "tsyringe";

@injectable()
export class VoiceUseCase implements VoiceUseCasePort {
    constructor(@inject("CeVIOService") private cevioService: CeVIOServicePort) {}

    setVoiceControl(control: {
        volume?: number;
        speed?: number;
        tone?: number;
        toneScale?: number;
        alpha?: number;
    }): void {
        return this.cevioService.setParam(
            control.volume ?? 50,
            control.speed ?? 50,
            control.tone ?? 50,
            control.toneScale ?? 50,
            control.alpha ?? 50
        );
    }

    getEmotionName(cast: string) {
        const res = this.cevioService.getEmotionName(cast);
        return res;
    }

    textToVoice(cast: string, text: string, path: string): boolean {
        return this.cevioService.generateWav(cast, text, path);
    }
}
