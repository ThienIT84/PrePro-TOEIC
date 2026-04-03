# Part 7 Images Migration Guide

## 📋 Mục đích
Migrate dữ liệu ảnh Part 7 từ cấu trúc cũ (`img_url`, `img_url2`, `img_url3`) sang cấu trúc mới (`texts.additional`) để đồng nhất data structure.

## 🔍 Trước khi chạy

### Kiểm tra dữ liệu hiện tại:
```sql
-- Xem có bao nhiêu passages cần migrate
SELECT 
  COUNT(*) as total_old_structure,
  COUNT(DISTINCT passage_type) as passage_types
FROM passages
WHERE part = 7
  AND (
    (texts->>'img_url' IS NOT NULL AND texts->>'img_url' != '')
    OR (texts->>'img_url2' IS NOT NULL AND texts->>'img_url2' != '')
    OR (texts->>'img_url3' IS NOT NULL AND texts->>'img_url3' != '')
  )
  AND (texts->>'additional' IS NULL OR texts->>'additional' = '');
```

### Xem mẫu dữ liệu:
```sql
SELECT 
  id,
  passage_type,
  texts->>'title' as title,
  texts->>'img_url' as img1,
  texts->>'img_url2' as img2,
  texts->>'img_url3' as img3,
  texts->>'additional' as additional
FROM passages
WHERE part = 7
LIMIT 5;
```

## 🚀 Cách chạy Migration

### Option 1: Sử dụng Supabase Dashboard (Recommended)
1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy nội dung file `migrate_part7_images_to_additional.sql`
5. Paste vào editor và click **Run**

### Option 2: Sử dụng Supabase CLI
```powershell
# Navigate to project directory
cd d:\vibe-toeic\o-buddy-hello

# Run migration
supabase db push
```

### Option 3: Chạy từng bước thủ công
Nếu muốn kiểm soát từng bước, copy từng section trong file SQL và chạy lần lượt:
1. **Step 1**: Backup data
2. **Step 2**: Check current state
3. **Step 3**: Migrate data
4. **Step 4**: Verify migration
5. **Step 5**: (Optional) Clean up old fields

## ✅ Verify Migration thành công

### 1. Kiểm tra số lượng:
```sql
SELECT 
  passage_type,
  COUNT(*) as count
FROM passages
WHERE part = 7
  AND texts->>'additional' IS NOT NULL 
  AND texts->>'additional' != ''
GROUP BY passage_type
ORDER BY passage_type;
```

### 2. Kiểm tra cấu trúc dữ liệu:
```sql
SELECT 
  id,
  passage_type,
  texts->>'additional' as image_urls,
  (LENGTH(texts->>'additional') - LENGTH(REPLACE(texts->>'additional', '|', '')) + 1) as image_count
FROM passages
WHERE part = 7
ORDER BY passage_type, id
LIMIT 10;
```

**Kết quả mong đợi:**
- `single` passage: 1 URL (không có `|`)
- `double` passage: 2 URLs (có 1 ký tự `|`)
- `triple` passage: 3 URLs (có 2 ký tự `|`)

### 3. Test trên frontend:
1. Refresh browser
2. Vào exam Part 7
3. Kiểm tra ảnh hiển thị đầy đủ
4. Check console log: `🔍 Part 7 Images (OPTION A - texts.additional only)`

## 🔄 Rollback (nếu cần)

Nếu có vấn đề, restore từ backup:
```sql
-- Rollback to backup
UPDATE passages p
SET texts = b.texts
FROM passages_backup_20251021 b
WHERE p.id = b.id AND p.part = 7;

-- Verify rollback
SELECT COUNT(*) FROM passages WHERE part = 7;
```

## 🧹 Clean up (sau khi verify OK)

**⚠️ CHỈ chạy sau khi đã verify mọi thứ hoạt động tốt!**

Uncomment Step 5 trong file SQL và chạy lại để xóa các field cũ:
```sql
UPDATE passages
SET texts = texts - 'img_url' - 'img_url2' - 'img_url3'
WHERE part = 7
  AND texts->>'additional' IS NOT NULL 
  AND texts->>'additional' != '';
```

## 📊 Expected Results

### Trước migration:
```json
{
  "texts": {
    "img_url": "https://example.com/img1.jpg",
    "img_url2": "https://example.com/img2.jpg",
    "img_url3": "https://example.com/img3.jpg",
    "additional": ""
  }
}
```

### Sau migration:
```json
{
  "texts": {
    "additional": "https://example.com/img1.jpg | https://example.com/img2.jpg | https://example.com/img3.jpg",
    "img_url": "https://example.com/img1.jpg",  // Giữ lại để rollback (xóa ở Step 5)
    "img_url2": "https://example.com/img2.jpg",
    "img_url3": "https://example.com/img3.jpg"
  }
}
```

### Sau cleanup (Step 5):
```json
{
  "texts": {
    "additional": "https://example.com/img1.jpg | https://example.com/img2.jpg | https://example.com/img3.jpg"
  }
}
```

## ⚠️ Important Notes

1. **Backup được tạo tự động** ở Step 1: `passages_backup_20251021`
2. **Không xóa field cũ ngay lập tức** - giữ lại để có thể rollback
3. **Test kỹ trên frontend** trước khi chạy Step 5 (cleanup)
4. **Migration không ảnh hưởng** đến Part 6 hoặc các parts khác
5. **Code frontend đã sẵn sàng** - chỉ cần chạy migration là xong

## 📞 Support

Nếu gặp vấn đề:
1. Check console log trong browser (F12)
2. Check Supabase logs trong Dashboard
3. Verify backup table còn tồn tại: `SELECT COUNT(*) FROM passages_backup_20251021;`
4. Có thể rollback bất cứ lúc nào sử dụng backup

---

**Last Updated**: October 21, 2025  
**Migration File**: `migrate_part7_images_to_additional.sql`
