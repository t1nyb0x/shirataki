export interface VoiceUseCasePort {
    textToVoice(cast: string, text: string, path: string): boolean;
}
