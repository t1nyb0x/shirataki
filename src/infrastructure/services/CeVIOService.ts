import { logger } from "@/config/log4js";
import { CeVIOServicePort, PhonemeData, VoiceControlParams } from "@/domain/ports/CeVIOServicePort";
import { injectable } from "tsyringe";

interface ICevioService {
    StartHost(noWait: boolean): number;
    CloseHost(mode: number): void;
}

/** StartHostの戻り値。0は成功で、負数は失敗を表す。 */
const START_HOST_ERROR_REASONS = new Map<number, string>([
    [-1, "インストール状態が不明です。"],
    [-2, "実行ファイルが見つかりません。"],
    [-3, "プロセスの起動に失敗しました。"],
    [-4, "アプリケーション起動後、エラーにより終了しました。"],
]);

interface IComponent {
    Name: string;
    Value: number;
}

interface IPhonemeData {
    Phoneme: string;
    StartTime: number;
    EndTime: number;
}

interface ITalker {
    Cast: string;
    Speak(text: string): any;
    OutputWaveToFile(text: string, path: string): boolean;
    GetTextDuration(text: string): number;
    GetPhonemes(text: string): {
        Length: number;
        At(index: number): IPhonemeData;
    };
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
        this.startHost();
    }

    /**
     * CeVIO AIを起動する。
     * noWaitにfalseを渡し、外部からアクセス可能になるまで待つ。
     */
    private startHost() {
        const result = this.service.StartHost(false);
        if (result !== 0) {
            const reason = START_HOST_ERROR_REASONS.get(result) ?? "不明なエラーです。";
            const message = `CeVIO AIの起動に失敗しました。(コード: ${result}) ${reason}`;
            logger.error(message);
            throw new Error(message);
        }
        logger.info("CeVIO AIを起動しました");
    }

    private setCast(cast: string) {
        if (this.currentCast !== cast) {
            this.talker.Cast = cast;
            this.currentCast = cast;
        }
    }

    private logVoiceParameters() {
        logger.info(`
現在のキャスト: ${this.talker.Cast}
音量: ${this.talker.Volume}
話す速さ: ${this.talker.Speed}
トーン: ${this.talker.Tone}
抑揚: ${this.talker.ToneScale}
声質: ${this.talker.Alpha}`);

        const components = this.talker.Components;
        for (let i = 0; i < components.Length; i++) {
            const comp = components.At(i);
            logger.info(`${comp.Name}: ${comp.Value}`);
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
            logger.info(`生成されたWAVファイル: ${path}`);
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

        logger.info(`声のパラメータを更新: ${JSON.stringify(params)}`);
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

    getTextDuration(cast: string, text: string): number {
        this.setCast(cast);
        return this.talker.GetTextDuration(text);
    }

    getPhonemes(cast: string, text: string): PhonemeData[] {
        this.setCast(cast);
        const phonemes = this.talker.GetPhonemes(text);
        const count = phonemes.Length;
        const result: PhonemeData[] = [];
        for (let i = 0; i < count; i++) {
            const data = phonemes.At(i);
            result.push({ phoneme: data.Phoneme, startTime: data.StartTime, endTime: data.EndTime });
        }
        return result;
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
        // mode 0: CeVIO AIが編集中の場合、保存や終了キャンセルが可能
        this.service.CloseHost(0);
        logger.info("CeVIO AIの終了を要求しました");
    }
}
