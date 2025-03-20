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
        console.log(`Generate Wav File: ${path}`);
        return result;
    }

    // setPitch()

    close() {
        this.service.CloseHost(0);
    }
}
