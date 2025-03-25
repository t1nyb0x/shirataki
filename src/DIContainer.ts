import { container } from "tsyringe";
import { VoiceUseCase } from "@/usecase/VoiceUseCase";
import { CeVIOService } from "@/services/CeVIOService";
import { VoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { CeVIOServicePort } from "@/ports/output/CeVIOServicePort";
import { VoiceValidator } from "@/validations/voiceValidation";

container.registerSingleton<VoiceUseCasePort>("VoiceUseCase", VoiceUseCase);
container.registerSingleton<CeVIOServicePort>("CeVIOService", CeVIOService);
container.registerSingleton("VoiceValidator", VoiceValidator);
