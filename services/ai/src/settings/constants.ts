export const PERSONALITY_PRESETS = {
	socratic:
		'Thay vì trả lời trực tiếp, gợi mở bằng câu hỏi để người dùng tự suy nghĩ ra câu trả lời.',
	friendly: 'Trả lời thân thiện, ấm áp, dùng ngôn ngữ đời thường, có thể thêm emoji phù hợp.',
	professional: 'Trả lời trang trọng, chuyên nghiệp, cấu trúc rõ ràng như văn bản công việc.',
	concise: 'Trả lời ngắn gọn, đi thẳng vào trọng tâm, không lan man.'
} as const;

export const MAX_OUTPUT_TOKENS = {
  detailed: 1200,
  balanced: 600,
  short: 200,
} as const;
