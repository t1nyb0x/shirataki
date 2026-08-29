import { CeVIOServicePort, PhonemeData } from "@/domain/ports/CeVIOServicePort";
import { VoiceUseCasePort } from "@/domain/ports/VoiceUseCasePort";
import { inject, injectable } from "tsyringe";

@injectable()
export class VoiceUseCase implements VoiceUseCasePort {
    constructor(@inject("CeVIOService") private cevioService: CeVIOServicePort) {}

    private static readonly DEFAULT_CONTROL_VALUE = 50;
    private static readonly DEFAULT_EMOTION_VALUE = 0;

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

    /**
     * キャストの全感情成分を設定する。
     * CeVIOのTalkerは設定値を保持し続けるため、リクエストに含まれない成分は
     * DEFAULT_EMOTION_VALUEで打ち消し、リクエスト単体で結果が決まるようにする。
     */
    setEmotions(cast: string, emotions?: { name: string; value: number }[]): void {
        const requestedValues = new Map((emotions ?? []).map((emotion) => [emotion.name, emotion.value]));
        for (const emotionName of this.cevioService.getEmotionName(cast)) {
            this.cevioService.setEmotion(
                cast,
                emotionName,
                requestedValues.get(emotionName) ?? VoiceUseCase.DEFAULT_EMOTION_VALUE
            );
        }
    }

    speak(cast: string, text: string): boolean {
        return this.cevioService.speak(cast, text);
    }

    getTextDuration(cast: string, text: string): number {
        return this.cevioService.getTextDuration(cast, text);
    }

    getPhonemes(cast: string, text: string): PhonemeData[] {
        return this.cevioService.getPhonemes(cast, text);
    }

    getAvailableCasts(): string[] {
        return this.cevioService.getAvailableCasts();
    }
}
