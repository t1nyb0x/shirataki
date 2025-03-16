export interface CeVIOServicePort {
    speak(cast: string, text: string): void;
    generateWav(cast: string, text: string, path: string): boolean;
    close(): void;
}
