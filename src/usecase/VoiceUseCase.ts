import { CeVIOServicePort } from "@/ports/output/CeVIOServicePort";
import { VoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { inject, injectable } from "tsyringe";

@injectable()
export class VoiceUseCase implements VoiceUseCasePort {
    constructor(@inject("CeVIOService") private cevioService: CeVIOServicePort) {}

    private static readonly DEFAULT_CONTROL_VALUE = 50;

    setVoiceControl(
        cast: string,
        control: {
            volume?: number;
            speed?: number;
            tone?: number;
            toneScale?: number;
            alpha?: number;
        }
    ): void {
        const params = {
            volume: control.volume ?? VoiceUseCase.DEFAULT_CONTROL_VALUE,
            speed: control.speed ?? VoiceUseCase.DEFAULT_CONTROL_VALUE,
            tone: control.tone ?? VoiceUseCase.DEFAULT_CONTROL_VALUE,
            toneScale: control.toneScale ?? VoiceUseCase.DEFAULT_CONTROL_VALUE,
            alpha: control.alpha ?? VoiceUseCase.DEFAULT_CONTROL_VALUE,
        };
        return this.cevioService.setParam(cast, params);
    }

    getEmotionName(cast: string): string[] {
        const res = this.cevioService.getEmotionName(cast);
        return res;
    }

    textToVoice(cast: string, text: string, path: string): boolean {
        return this.cevioService.generateWav(cast, text, path);
    }
}
