# Row Level Security (RLS) — PrePro-TOEIC

## Nguyên tắc RLS

1. **Mọi table đều bật RLS** — không ai truy cập được nếu không có policy
2. **Student** chỉ xem/sửa data của mình
3. **Teacher** xem tất cả data, tạo/sửa questions và exam_sets
4. **Auth check**: `auth.uid()` để lấy user ID hiện tại

## Pattern chung

### SELECT policy (ai được xem?)
```sql
CREATE POLICY "Students can view own data"
  ON table_name FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can view all data"
  ON table_name FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );
```

### INSERT policy (ai được tạo?)
```sql
CREATE POLICY "Teachers can create questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );
```

### UPDATE/DELETE policy
```sql
CREATE POLICY "Teachers can update own questions"
  ON questions FOR UPDATE
  USING (created_by = auth.uid());
```

## RLS theo table

| Table | Student | Teacher |
|-------|---------|--------|
| `profiles` | Own only | All |
| `questions` | Published only | All + CRUD |
| `passages` | Published questions' passages | All + CRUD |
| `exam_sets` | Active only | All + CRUD |
| `exam_sessions` | Own only | All (view) |
| `exam_attempts` | Own only | All (view) |
| `reviews` | Own only | N/A |
| `classes` | Enrolled only | Own classes |

## Lưu ý khi phát triển

- **Luôn test với cả student và teacher role** khi tạo query mới
- **Sử dụng `supabase.auth.getUser()`** thay vì trust client-side role
- **Không bypass RLS** trừ khi dùng service_role key (chỉ server-side)
- **Check error từ Supabase**: RLS violation trả về empty result, không phải error
