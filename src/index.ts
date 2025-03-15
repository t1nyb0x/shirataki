interface ICevioService {
    StartHost(waitForReady: boolean): boolean;
    CloseHost(timeout: number): void;
}

interface ITalker {
    Cast: string;
    Speak(text: string): any;
}

class CeVIO {
    private service: ICevioService;
    private talker: ITalker;

    constructor(cast: string) {
        require("winax");
        this.service = new ActiveXObject("CeVIO.Talk.RemoteService2.ServiceControl2V40") as ICevioService;
        this.talker = new ActiveXObject("CeVIO.Talk.RemoteService2.Talker2V40") as ITalker;

        this.service.StartHost(false);
        this.talker.Cast = cast;
    }

    speak(text: string) {
        console.log(`📢 Speaking: ${text}`);
        const state = this.talker.Speak(text);
        (state as any).Wait();
    }

    close() {
        this.service.CloseHost(0);
    }
}

const cevio = new CeVIO("花隈千冬");
cevio.speak("こんにちは、花隈千冬です。");
cevio.close();
