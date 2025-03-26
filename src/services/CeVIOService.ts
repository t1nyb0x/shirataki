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
    private currentCast: string = "";

    constructor() {
        require("winax");
        this.service = new ActiveXObject("CeVIO.Talk.RemoteService2.ServiceControl2V40") as ICevioService;
        this.talker = new ActiveXObject("CeVIO.Talk.RemoteService2.Talker2V40") as ITalker;
        this.service.StartHost(false);
    }

    private setCast(cast: string) {
        if (this.currentCast !== cast) {
            this.talker.Cast = cast;
            this.currentCast = cast;
        }
    }

    private logVoiceParameters() {
        console.log(`
現在のキャスト: ${this.talker.Cast}
音量: ${this.talker.Volume}
話す速さ: ${this.talker.Speed}
トーン: ${this.talker.Tone}
抑揚: ${this.talker.ToneScale}
声質: ${this.talker.Alpha}`);

        const components = this.talker.Components;
        for (let i = 0; i < components.Length; i++) {
            const comp = components.At(i);
            console.log(`${comp.Name}: ${comp.Value}`);
        }
    }

    speak(cast: string, text: string): boolean {
        this.setCast(cast);
        console.log(`📢 Speaking: ${text}`);

        try {
            const state = this.talker.Speak(text);
            (state as any).Wait();
            return state.IsSucceeded;
        } catch (error) {
            console.error(`音声生成エラー: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }

    generateWav(cast: string, text: string, path: string): boolean {
        this.setCast(cast);

        try {
            const result = this.talker.OutputWaveToFile(text, path);
            this.logVoiceParameters();
            console.log(`生成されたWAVファイル: ${path}`);
            return result;
        } catch (error) {
            console.error(`WAV生成エラー: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }

    setParam(cast: string, params: VoiceControlParams) {
        this.setCast(cast);
        const { volume, speed, tone, toneScale, alpha } = params;

        this.talker.Volume = volume;
        this.talker.Speed = speed;
        this.talker.Tone = tone;
        this.talker.ToneScale = toneScale;
        this.talker.Alpha = alpha;

        console.log(`声のパラメータを更新: ${JSON.stringify(params)}`);
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

    getAvailableCasts(): string[] {
        const casts: string[] = [];
        const count = this.talker.AvailableCasts.Length;
        for (let i = 0; i < count; i++) {
            casts.push(this.talker.AvailableCasts.At(i));
        }
        return casts;
    }

    close() {
        this.service.CloseHost(0);
    }
}
