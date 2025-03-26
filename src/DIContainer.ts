import { container } from "tsyringe";
import { VoiceUseCase } from "@/application/usecases/VoiceUseCase";
import { CeVIOService } from "@/infrastructure/services/CeVIOService";
import { VoiceUseCasePort } from "@/domain/ports/VoiceUseCasePort";
import { CeVIOServicePort } from "@/domain/ports/CeVIOServicePort";
import { VoiceValidator } from "@/application/validations/voiceValidation";

container.registerSingleton<VoiceUseCasePort>("VoiceUseCase", VoiceUseCase);
container.registerSingleton<CeVIOServicePort>("CeVIOService", CeVIOService);
container.registerSingleton("VoiceValidator", VoiceValidator);
