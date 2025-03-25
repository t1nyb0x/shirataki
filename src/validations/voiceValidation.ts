import { VoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { injectable, inject } from "tsyringe";
import { ValidationError } from "@/errors/AppError";

@injectable()
export class VoiceValidator {
    constructor(@inject("VoiceUseCase") private voiceUseCase: VoiceUseCasePort) {}

    async validateEmotions(cast: string, emotions?: { name: string; value: number }[]): Promise<void> {
        if (!emotions) return;

        const availableEmotions = await this.voiceUseCase.getEmotionName(cast);
        for (const emotion of emotions) {
            if (!availableEmotions.includes(emotion.name)) {
                throw new ValidationError(
                    `無効な感情名です: ${emotion.name}。有効な感情: ${availableEmotions.join(", ")}`
                );
            }
            if (emotion.value < 0 || emotion.value > 100) {
                throw new ValidationError(
                    `感情値は0〜100の範囲で指定してください。入力された値 ${emotion.name}: ${emotion.value}`
                );
            }
        }
    }
}
