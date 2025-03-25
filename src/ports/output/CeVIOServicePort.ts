export interface VoiceControlParams {
    volume: number;
    speed: number;
    tone: number;
    toneScale: number;
    alpha: number;
}

export interface CeVIOServicePort {
    speak(cast: string, text: string): void;
    generateWav(cast: string, text: string, path: string): boolean;
    setParam(cast: string, params: VoiceControlParams): void;
    getEmotionName(cast: string): string[];
    setEmotion(cast: string, emotionName: string, value: number): void;
    close(): void;
}
