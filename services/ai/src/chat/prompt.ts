import type { MessageMetadata } from '@/database/schema';
import type { UserAiSettings } from '@/settings';

import { buildSystemInstruction } from '@/settings';

function getResponseLengthInstruction(length: 'balanced' | 'detailed' | 'short'): string {
  switch (length) {
    case 'short':
      return `- **Độ dài**: Ngắn gọn (tối đa 2-3 câu). Trả lời trực tiếp vào trọng tâm.`;
    case 'balanced':
      return `- **Độ dài**: Vừa phải (dưới 250 từ). Trình bày tự nhiên, chỉ dùng danh sách hoặc ví dụ khi thực sự cần thiết.`;
    case 'detailed':
      return `- **Độ dài**: Chi tiết (khoảng 400-500 từ). Phân tích sâu, linh hoạt dùng định dạng và ví dụ để làm rõ ý.`;
  }
}

export function buildSystemPrompt(
  settings: UserAiSettings,
  userMessageMetadata?: MessageMetadata,
): string {
  const lengthInstruction = getResponseLengthInstruction(settings.responseLength);

  const dateObj = userMessageMetadata?.createdAt
    ? new Date(userMessageMetadata.createdAt)
    : new Date();

  const currentDate = dateObj.toLocaleString('sv-SE', {
    timeZone: userMessageMetadata?.timeZone,
    minute: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    year: 'numeric',
    day: '2-digit',
    hour12: false,
  });

  const timeZoneStr = userMessageMetadata?.timeZone ? ` (${userMessageMetadata.timeZone})` : '';

  return `Bạn là "${settings.botName}", trợ lý Synapse.
${buildSystemInstruction(settings)}

[ĐỘ DÀI]
${lengthInstruction}

[TOOL MATCHING - THEO ƯU TIÊN]
0. KHÔNG TOOL: Hỏi đáp chung, code, toán, logic, chào hỏi -> Trả lời ngay.
1. searchNotes (Dữ liệu cá nhân): Lịch hẹn, mật khẩu, ghi chú. (Hỏi chung/mới nhất -> query: ""; Cụ thể -> query: 1-2 từ khóa).
2. searchChatHistory (Nội bộ phiên chat): Hỏi lại nội dung đã nói trong cuộc trò chuyện này.
3. searchWeb (Thời gian thực): Thời tiết, tỷ giá, giá vàng, tin tức thời sự.

[XỬ LÝ DỮ LIỆU NOTES]
- Mặc định: Chỉ trích xuất & tóm tắt đúng đáp án. Không in nguyên văn/lộ thông tin không liên quan.
- Chỉ in nguyên văn khi user yêu cầu trực tiếp ("đọc hết", "in toàn bộ").

[PHẢN HỒI]
Trả lời thẳng vấn đề, thân thiện. Lịch hiện tại: ${currentDate}${timeZoneStr}.`;
}
