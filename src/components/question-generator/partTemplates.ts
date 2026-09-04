export interface PartTemplate {
  title: string;
  template: string;
}

export const getPartTemplate = (part: number): PartTemplate => {
  switch (part) {
    case 5:
      return {
        title: "Part 5 - Incomplete Sentences",
        template: `Tạo câu hỏi Part 5 TOEIC với format sau:

1. Loại câu hỏi: Incomplete Sentences
2. Chủ đề: Business context
3. Cấu trúc: Câu không hoàn chỉnh với 4 lựa chọn
4. Focus: Grammar, Vocabulary, Prepositions, Conjunctions

Yêu cầu:
- Ngữ cảnh kinh doanh thực tế
- Ngôn ngữ trang trọng, chuyên nghiệp
- 4 lựa chọn A, B, C, D
- Mỗi câu test một kỹ năng khác nhau
- Độ dài câu vừa phải (15-25 từ)
- Giải thích rõ ràng cho đáp án đúng`
      };
    case 6:
      return {
        title: "Part 6 - Text Completion",
        template: `Tạo một passage Part 6 TOEIC với format sau:

1. Loại văn bản: Report/Email/Memo/Letter
2. Chủ đề: Business context
3. Cấu trúc: 4 đoạn văn, 4 chỗ trống
4. Chỗ trống 1: Preposition/Time expression
5. Chỗ trống 2: Conjunction/Reason expression
6. Chỗ trống 3: Verb/Phrase expression
7. Chỗ trống 4: Adjective/Adverb expression

Yêu cầu:
- Ngữ cảnh kinh doanh thực tế
- Ngôn ngữ trang trọng, chuyên nghiệp
- 4 chỗ trống được đánh số 1, 2, 3, 4
- Mỗi chỗ trống test một kỹ năng khác nhau
- Passage dài 200-250 từ
- Phải đánh dấu 4 blank_text trong đoạn văn`
      };
    case 7:
      return {
        title: "Part 7 - Reading Comprehension",
        template: `Tạo Part 7 TOEIC với format sau:

1. Số lượng passages: 1-3 passages liên quan
2. Loại văn bản: Email/Article/Advertisement/Notice/Memo/Letter
3. Chủ đề: Business context (meeting, product, announcement, etc.)
4. Cấu trúc: Multiple passages + 2-5 câu hỏi
5. Câu hỏi: Main idea, Detail, Inference, Vocabulary, Purpose

Yêu cầu:
- Passages liên quan cùng chủ đề
- Mỗi passage khác loại văn bản
- Ngữ cảnh kinh doanh thực tế
- Ngôn ngữ trang trọng, chuyên nghiệp
- Passage dài 150-300 từ mỗi cái
- 2-5 câu hỏi đa lựa chọn
- Câu hỏi test kỹ năng khác nhau
- Đáp án rõ ràng, không gây nhầm lẫn
- Passages có thể đọc độc lập hoặc liên kết`
      };
    default:
      return {
        title: "Template Prompt",
        template: "Chọn Part để xem template tương ứng"
      };
  }
};
