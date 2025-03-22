export interface VoiceUseCasePort {
    setVoiceControl(control: {
        volume?: number;
        speed?: number;
        tone?: number;
        toneScale?: number;
        alpha?: number;
    }): void;
    getEmotionName(cast: string): string[];
    textToVoice(cast: string, text: string, path: string): boolean;
}
