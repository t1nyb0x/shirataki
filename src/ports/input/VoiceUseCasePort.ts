export interface SampleVoiceUseCasePort {
    textToVoice(cast: string, text: string, path: string): boolean;
}
