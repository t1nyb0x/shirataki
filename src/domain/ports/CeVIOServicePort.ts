export interface VoiceControlParams {
    volume: number;
    speed: number;
    tone: number;
    toneScale: number;
    alpha: number;
}

export interface PhonemeData {
    phoneme: string;
    startTime: number;
    endTime: number;
}

export interface CeVIOServicePort {
    speak(cast: string, text: string): boolean;
    generateWav(cast: string, text: string, path: string): boolean;
    setParam(cast: string, params: VoiceControlParams): void;
    getEmotionName(cast: string): string[];
    setEmotion(cast: string, emotionName: string, value: number): void;
    getTextDuration(cast: string, text: string): number;
    getPhonemes(cast: string, text: string): PhonemeData[];
    getAvailableCasts(): string[];
    close(): void;
}
