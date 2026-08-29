import { PhonemeData } from "@/domain/ports/CeVIOServicePort";

export interface VoiceUseCasePort {
    setVoiceControl(
        cast: string,
        control: {
            volume?: number;
            speed?: number;
            tone?: number;
            toneScale?: number;
            alpha?: number;
        }
    ): void;
    getEmotionName(cast: string): string[];
    textToVoice(cast: string, text: string, path: string): boolean;
    setEmotions(cast: string, emotions?: { name: string; value: number }[]): void;
    speak(cast: string, text: string): boolean;
    getTextDuration(cast: string, text: string): number;
    getPhonemes(cast: string, text: string): PhonemeData[];
    getAvailableCasts(): string[];
}
