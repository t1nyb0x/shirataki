declare global {
    class ActiveXObject {
        constructor(progId: string);
    }
}

export {};
