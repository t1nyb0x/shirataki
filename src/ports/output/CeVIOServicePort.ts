export interface CeVIOServicePort {
    speak(cast: string, text: string): void;
    generateWav(cast: string, text: string, path: string): boolean;
    setParam(cast: string, volume: number, speed: number, tone: number, toneScale: number, alpha: number): any;
    getEmotionName(cast: string): string[];
    close(): void;
}
