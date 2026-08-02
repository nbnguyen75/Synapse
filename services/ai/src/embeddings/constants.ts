// Giới hạn khớp với Notes service (Note.java MAX_CONTENT_LENGTH = 1500) và
// dưới ngưỡng 2048 token của gemini-embedding-001. Vì Notes service đã chặn ở input,
// đây chỉ là safeguard thứ 2 phòng khi dữ liệu cũ hoặc nguồn khác không qua validate.
export const MAX_EMBEDDING_INPUT_LENGTH = 1500;
