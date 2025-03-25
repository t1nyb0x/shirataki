import { CeVIOServicePort, VoiceControlParams } from "@/ports/output/CeVIOServicePort";
import { injectable } from "tsyringe";

interface ICevioService {
    StartHost(waitForReady: boolean): boolean;
    CloseHost(timeout: number): void;
}

interface IComponent {
    Name: string;
    Value: number;
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
    Components: {
        Length: number;
        At(index: number): IComponent;
        ByName(name: string): IComponent;
    };
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

    private setCast(cast: string) {
        this.talker.Cast = cast;
    }

    speak(cast: string, text: string) {
        this.setCast(cast);
        console.log(`📢 Speaking: ${text}`);
        const state = this.talker.Speak(text);
        (state as any).Wait();
        return;
    }

    generateWav(cast: string, text: string, path: string): boolean {
        this.setCast(cast);

        const result = this.talker.OutputWaveToFile(text, path);

        console.log(this.talker.Cast);

        console.log(`音量: ${this.talker.Volume}
    話す速さ: ${this.talker.Speed}
    トーン: ${this.talker.Tone}
    抑揚: ${this.talker.ToneScale}
    声質: ${this.talker.Alpha}`);

        const components = this.talker.Components;
        const count = components.Length;
        for (let i = 0; i < count; i++) {
            const comp = components.At(i);
            console.log(comp.Name, ": ", comp.Value);
        }
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
    setParam(cast: string, params: VoiceControlParams) {
        this.setCast(cast);
        this.talker.Volume = params.volume;
        this.talker.Speed = params.speed;
        this.talker.Tone = params.tone;
        this.talker.ToneScale = params.toneScale;
        this.talker.Alpha = params.alpha;
    }

    getEmotionName(cast: string): string[] {
        this.setCast(cast);
        const components = this.talker.Components;
        const count = components.Length;
        let emotionName: string[] = [];
        for (let i = 0; i < count; i++) {
            const comp = components.At(i);
            emotionName.push(comp.Name);
        }
        return emotionName;
    }

    setEmotion(cast: string, emotionName: string, value: number) {
        this.setCast(cast);
        try {
            const component = this.talker.Components.ByName(emotionName);
            component.Value = value;
        } catch (error) {
            throw new Error(
                `Failed to set emotion: ${emotionName}. ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    close() {
        this.service.CloseHost(0);
    }
}
