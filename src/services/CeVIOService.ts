import { CeVIOServicePort } from "@/ports/CeVIOServicePort";
import { injectable } from "tsyringe";

interface ICevioService {
    StartHost(waitForReady: boolean): boolean;
    CloseHost(timeout: number): void;
}

interface ITalker {
    Cast: string;
    Speak(text: string): any;
    OutputWaveToFile(text: string, path: string): boolean;
    Volume: number;
    Speed: number;
    Tone: number;
    ToneScale: number;
    Alpha: number;
    Components: any;
    AvailableCasts: any;
}

@injectable()
export class CeVIOService implements CeVIOServicePort {
    private service: ICevioService;
    private talker: ITalker;

    constructor() {
        require("winax");
        this.service = new ActiveXObject("CeVIO.Talk.RemoteService2.ServiceControl2V40") as ICevioService;
        this.talker = new ActiveXObject("CeVIO.Talk.RemoteService2.Talker2V40") as ITalker;

        this.service.StartHost(false);
    }

    speak(cast: string, text: string) {
        this.talker.Cast = cast;
        console.log(`📢 Speaking: ${text}`);
        const state = this.talker.Speak(text);
        (state as any).Wait();
        return;
    }

    generateWav(cast: string, text: string, path: string): boolean {
        this.talker.Cast = cast;

        const result = this.talker.OutputWaveToFile(text, path);

        console.log(this.talker.Cast);

        console.log(`音量: ${this.talker.Volume}
    話す速さ: ${this.talker.Speed}
    トーン: ${this.talker.Tone}
    抑揚: ${this.talker.ToneScale}
    声質: ${this.talker.Alpha}`);
        console.log(`Generate Wav File: ${path}`);
        return result;
    }

    /**
     * 声のパラメータを設定する
     * @param volume 音量
     * @param speed 読む速さ
     * @param tone トーン
     * @param toneScale 抑揚
     * @param alpha 音質
     * @returns
     */
    setParam(cast: string, volume: number, speed: number, tone: number, toneScale: number, alpha: number) {
        this.talker.Cast = cast;
        this.talker.Volume = volume;
        this.talker.Speed = speed;
        this.talker.Tone = tone;
        this.talker.ToneScale = toneScale;
        this.talker.Alpha = alpha;
        return;
    }

    getEmotionName(cast: string): string[] {
        this.talker.Cast = cast;
        const components = this.talker.Components;
        const count = components.Length;
        let emotionName: string[] = [];
        for (let i = 0; i < count; i++) {
            const comp = components.At(i);
            emotionName.push(comp.Name);
        }
        return emotionName;
    }

    setEmotion() {}

    close() {
        this.service.CloseHost(0);
    }
}
