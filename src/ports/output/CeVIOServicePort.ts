export interface VoiceControlParams {
    volume: number;
    speed: number;
    tone: number;
    toneScale: number;
    alpha: number;
}

export interface CeVIOServicePort {
    speak(cast: string, text: string): boolean;
    generateWav(cast: string, text: string, path: string): boolean;
    setParam(cast: string, params: VoiceControlParams): void;
    getEmotionName(cast: string): string[];
    setEmotion(cast: string, emotionName: string, value: number): void;
    getAvailableCasts(): string[];
    close(): void;
}
