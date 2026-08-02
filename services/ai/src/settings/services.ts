import { settingsSchema, type UserAiSettings } from '@/settings/schemas';
import { findByUserId, upsert } from '@/settings/repository';
import { PERSONALITY_PRESETS } from '@/settings/constants';

export async function getUserSettings(userId: string): Promise<UserAiSettings> {
	const row = await findByUserId(userId);
	if (!row) return settingsSchema.parse({});

	return {
		customInstructions: row.customInstructions ?? undefined,
		responseLength: row.responseLength,
		language: row.language,
		useEmoji: row.useEmoji,
		botName: row.botName,
		preset: row.preset
	};
}

export async function saveUserSettings(userId: string, input: UserAiSettings) {
	await upsert(userId, input);
	return input;
}

export function buildSystemInstruction(settings: UserAiSettings): string {
	const personality =
		settings.preset === 'custom' && settings.customInstructions
			? settings.customInstructions
			: PERSONALITY_PRESETS[settings.preset === 'custom' ? 'friendly' : settings.preset];

	const languageLine =
		settings.language === 'auto'
			? 'Trả lời bằng đúng ngôn ngữ mà người dùng đang dùng để hỏi.'
			: `Luôn trả lời bằng ${settings.language === 'vi' ? 'tiếng Việt' : 'English'}, bất kể người dùng hỏi bằng ngôn ngữ nào.`;

	const lengthLine = {
		detailed: 'Trả lời chi tiết, đầy đủ, có thể chia đoạn hoặc bullet point.',
		short: 'Trả lời ngắn gọn nhất có thể, tối đa 2-3 câu.',
		balanced: 'Độ dài câu trả lời vừa phải, đủ ý.'
	}[settings.responseLength];

	return [
		`Tên của bạn là "${settings.botName}". Khi được hỏi bạn là ai, giới thiệu đúng tên này.`,
		`Phong cách: ${personality}`,
		languageLine,
		lengthLine,
		settings.useEmoji ? 'Có thể dùng emoji phù hợp trong câu trả lời.' : 'Không dùng emoji.'
	].join('\n');
}
