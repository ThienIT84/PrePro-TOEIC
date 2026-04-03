# 🔍 DEBUG: Translation không hiển thị trong Exam Review

## Vấn đề
Part 7 có dữ liệu `translation_vi` trong database nhưng không hiển thị trên UI.

## Các bước debug

### 1. Kiểm tra Browser Console
Mở DevTools (F12) → Console tab → tìm log:

```
🔍 PassageDisplay Debug: {
  hasTranslations: true/false,
  translationVi: {...},
  activeTab: "vietnamese",
  translationViContent: "...",
  translationViContentLength: 1234
}
```

**Nếu `hasTranslations = false`**: Database query không trả về translation
**Nếu `translationViContent = null/undefined`**: Format dữ liệu sai

### 2. Kiểm tra Database
Vào **Supabase Dashboard** → **Table Editor** → `passages` → Tìm passage Part 7

Kiểm tra cột `translation_vi`:
```json
{
  "content": "Nội dung tiếng Việt...",
  "content2": null,
  "content3": null
}
```

**Nếu cột không tồn tại**: Chạy migration (xem bên dưới)
**Nếu giá trị null**: Chưa nhập translation

### 3. Kiểm tra Network Request
DevTools → Network tab → Filter "passages" → Xem response:

```json
{
  "id": "...",
  "translation_vi": {
    "content": "..."
  }
}
```

**Nếu không có `translation_vi` trong response**: RLS policy issue hoặc cột chưa tồn tại

## Giải pháp

### A. Nếu chưa chạy migration (cột `translation_vi` không tồn tại)

Vào **Supabase Dashboard** → **SQL Editor** → Run:

```sql
ALTER TABLE passages 
ADD COLUMN IF NOT EXISTS translation_vi JSONB DEFAULT NULL;

ALTER TABLE passages 
ADD COLUMN IF NOT EXISTS translation_en JSONB DEFAULT NULL;
```

### B. Nếu dữ liệu đã lưu nhưng format sai

Kiểm tra dữ liệu có dạng:
```json
{
  "content": "string value here",
  "content2": null
}
```

**KHÔNG PHẢI**:
```json
"content: string value"  // ❌ Sai format
```

### C. Update dữ liệu qua UI

1. Vào `/questions` → Tab "Quản lý đoạn văn"
2. Tìm passage Part 7 (ID: xem trong console log)
3. Click "Edit"
4. Cuộn xuống "Translation - Bản dịch"
5. Nhập vào ô "Tiếng Việt (Content 1)"
6. Click "Lưu"

### D. Update dữ liệu qua SQL

```sql
UPDATE passages 
SET translation_vi = jsonb_build_object(
  'content', 'Gửi: Bill Johnson — Từ: Laurie Wheeler...'
)
WHERE part = 7 
  AND texts->>'content' LIKE '%Bill Johnson%';
```

## Checklist Debug

- [ ] Migration đã chạy (cột tồn tại)
- [ ] Dữ liệu đã lưu trong database
- [ ] Format JSON đúng
- [ ] Console log hiển thị `hasTranslations: true`
- [ ] Console log hiển thị `translationViContent: "..."`
- [ ] Tab "Tiếng Việt" xuất hiện
- [ ] Click tab hiển thị nội dung

## Console Commands để kiểm tra nhanh

Trong browser console, chạy:

```javascript
// Kiểm tra data đã load
document.querySelectorAll('[class*="prose"]').forEach(el => {
  console.log('Content:', el.textContent.substring(0, 100));
});

// Kiểm tra tab active
document.querySelector('[role="tablist"]')?.getAttribute('aria-labelledby');
```

## Kết quả mong đợi

Sau khi fix, bạn sẽ thấy:
- ✅ Tab "🇻🇳 Tiếng Việt" hiển thị
- ✅ Click tab → hiện nội dung bản dịch
- ✅ Nút "Ẩn bản dịch" / "Hiện bản dịch" hoạt động
- ✅ Badge "🇻🇳 Có bản dịch tiếng Việt" màu xanh

---

**Cập nhật:** 2025-10-22
**Các file đã sửa:**
- `src/components/PassageDisplay.tsx` - Thêm validation và debug log
- `supabase/migrations/20251022_add_translations_to_passages.sql` - Migration mới
