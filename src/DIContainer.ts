import { container } from "tsyringe";
import { SampleVoiceUseCase } from "@/usecase/SampleVoiceUseCase";
import { CeVIOService } from "@/Services/CeVIOService";
import { SampleVoiceUseCasePort } from "@/ports/input/VoiceUseCasePort";
import { CeVIOServicePort } from "@/ports/CeVIOServicePort";

container.registerSingleton<SampleVoiceUseCasePort>("SampleVoiceUseCase", SampleVoiceUseCase);

container.registerSingleton<CeVIOServicePort>("CeVIOService", CeVIOService);
