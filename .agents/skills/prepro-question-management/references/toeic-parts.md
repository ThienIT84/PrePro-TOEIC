# Chi tiết 7 Parts TOEIC

## Part 1 — Photographs (Mô tả ảnh)
- **Input**: 1 image + 4 audio statements
- **Database fields bắt buộc**: `image_url`, `audio_url`, `prompt_text` (mô tả)
- **Choices**: 4 câu mô tả ảnh (A/B/C/D)
- **Không cần passage**

## Part 2 — Question-Response (Hỏi đáp)
- **Input**: 1 audio question + 3 audio responses
- **Database fields bắt buộc**: `audio_url`, `transcript`
- **Choices**: 3 câu trả lời (A/B/C) — **chỉ Part 2 có 3 choices**
- **Lưu ý**: Trong database vẫn lưu 4 choices (D = empty string)
- **Không cần passage**

## Part 3 — Conversations (Hội thoại)
- **Input**: 1 passage (hội thoại) + audio + 3 questions per passage
- **Database fields bắt buộc**: `passage_id`, `audio_url`, `transcript`
- **Passage type**: luôn `single`
- **Mỗi passage có 3 câu hỏi liên quan**

## Part 4 — Talks (Bài nói)
- **Input**: 1 passage (bài nói) + audio + 3 questions per passage
- **Tương tự Part 3 nhưng là monologue thay vì dialogue**
- **Passage type**: luôn `single`

## Part 5 — Incomplete Sentences (Điền câu)
- **Input**: 1 câu có chỗ trống + 4 choices
- **Chỉ cần**: `prompt_text`, `choices`, `correct_choice`
- **Không cần passage, audio, image**
- **Tags thường**: grammar_tenses, grammar_prepositions, vocabulary_business, ...

## Part 6 — Text Completion (Điền đoạn văn)
- **Input**: 1 passage (đoạn văn) + 4 câu hỏi điền chỗ trống
- **Database fields bắt buộc**: `passage_id`, `blank_index` (1-4)
- **Passage type**: luôn `single`
- **`blank_index`**: vị trí chỗ trống trong đoạn văn (1 đến 4)

## Part 7 — Reading Comprehension (Đọc hiểu)
- **Input**: Passage(s) + câu hỏi
- **3 sub-types**:
  - **Single passage**: 2-4 câu hỏi, `passage_type = 'single'`
  - **Double passage**: 5 câu hỏi, `passage_type = 'double'`, dùng `texts.content` + `texts.content2`
  - **Triple passage**: 5 câu hỏi, `passage_type = 'triple'`, dùng `texts.content` + `texts.content2` + `texts.content3`

## Full TOEIC Test Structure

| Section | Parts | Câu hỏi | Thời gian |
|---------|-------|---------|----------|
| Listening | 1-4 | 100 | 45 phút |
| Reading | 5-7 | 100 | 75 phút |
| **Total** | **1-7** | **200** | **120 phút** |

Điểm TOEIC: 10-990 (Listening: 5-495, Reading: 5-495)
