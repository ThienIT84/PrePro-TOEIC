# 🚨 SECURITY INCIDENT - API Keys Exposed

## ⚠️ Tình Huống

Supabase credentials đã bị hardcode trong file `src/integrations/supabase/client.ts` và có thể đã bị push lên GitHub.

## 🔴 Thông Tin Bị Lộ

- **Supabase URL:** `https://jyqzpxjojyudablllzke.supabase.co`
- **Supabase Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **File:** `src/integrations/supabase/client.ts`

## ✅ Đã Sửa

1. ✅ Xóa hardcoded credentials khỏi code
2. ✅ Thêm validation cho environment variables
3. ✅ Tạo `.env.example` với placeholder values
4. ✅ Cập nhật `.gitignore` để ignore `.env*` files
5. ✅ Tạo `SECURITY.md` với best practices

## 🚨 HÀNH ĐỘNG KHẨN CẤP CẦN LÀM NGAY

### Bước 1: Kiểm Tra Git History

```bash
# Kiểm tra xem credentials đã được commit chưa
git log --all --full-history -- src/integrations/supabase/client.ts

# Kiểm tra xem đã push lên remote chưa
git log origin/main --oneline
```

### Bước 2: Nếu ĐÃ COMMIT nhưng CHƯA PUSH

```bash
# Reset commit cuối cùng (giữ lại changes)
git reset --soft HEAD~1

# Hoặc amend commit cuối
git add src/integrations/supabase/client.ts
git commit --amend --no-edit
```

### Bước 3: Nếu ĐÃ PUSH lên GitHub

#### Option A: Xóa khỏi Git History (Recommended)

```bash
# Backup trước khi làm
git branch backup-before-cleanup

# Xóa file khỏi history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/integrations/supabase/client.ts" \
  --prune-empty --tag-name-filter cat -- --all

# Thêm lại file đã sửa
git add src/integrations/supabase/client.ts
git commit -m "fix: remove hardcoded credentials, use env variables"

# Force push (CẢNH BÁO: Sẽ overwrite remote history)
git push origin --force --all
git push origin --force --tags
```

#### Option B: Sử dụng BFG Repo-Cleaner (Nhanh hơn)

```bash
# Install BFG
# Mac: brew install bfg
# Windows: Download from https://rtyley.github.io/bfg-repo-cleaner/

# Clone mirror
git clone --mirror https://github.com/YOUR_USERNAME/prepro-toeic.git

# Xóa credentials
bfg --replace-text passwords.txt prepro-toeic.git

# Push changes
cd prepro-toeic.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push
```

### Bước 4: ROTATE CREDENTIALS NGAY (QUAN TRỌNG NHẤT!)

#### Supabase:

1. Vào https://app.supabase.com/project/jyqzpxjojyudablllzke/settings/api
2. Click "Reset anon key" hoặc "Regenerate anon key"
3. Copy key mới
4. Cập nhật vào `.env.local` (local) và hosting platform (production)

**LƯU Ý:** Anon key là public key, không quá nguy hiểm nếu bạn có RLS policies. Nhưng vẫn nên rotate để an toàn.

#### Kiểm tra RLS Policies:

```sql
-- Vào Supabase SQL Editor, chạy:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

Đảm bảo tất cả tables có RLS policies!

### Bước 5: Setup Environment Variables

#### Local Development:

```bash
# Tạo file .env.local (file này sẽ KHÔNG được commit)
cp .env.example .env.local

# Mở .env.local và điền credentials mới
nano .env.local
```

Nội dung `.env.local`:
```env
VITE_SUPABASE_URL=https://jyqzpxjojyudablllzke.supabase.co
VITE_SUPABASE_ANON_KEY=<NEW_ANON_KEY_HERE>
VITE_GROQ_API_KEY=<YOUR_GROQ_KEY_IF_ANY>
```

#### Production (Vercel/Netlify):

1. Vào dashboard của hosting platform
2. Settings → Environment Variables
3. Thêm:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY` (optional)

### Bước 6: Verify Fix

```bash
# Test local
npm run dev

# Kiểm tra console, không có lỗi về missing env vars

# Test build
npm run build

# Kiểm tra dist/ không chứa credentials
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" dist/
# Kết quả: không tìm thấy gì
```

### Bước 7: Monitor Supabase Usage

1. Vào https://app.supabase.com/project/jyqzpxjojyudablllzke
2. Check "Database" → "Usage" tab
3. Xem có activity bất thường không
4. Check "Auth" → "Users" - có user lạ không?

## 📋 Checklist

- [ ] Đã xóa hardcoded credentials khỏi code
- [ ] Đã commit changes mới
- [ ] Đã xóa credentials khỏi Git history (nếu đã push)
- [ ] Đã rotate Supabase anon key
- [ ] Đã tạo `.env.local` với credentials mới
- [ ] Đã verify `.env.local` trong `.gitignore`
- [ ] Đã test app chạy được với env vars
- [ ] Đã setup env vars trên production hosting
- [ ] Đã check Supabase usage không có gì bất thường
- [ ] Đã enable RLS policies trên tất cả tables

## 🛡️ Phòng Ngừa Tương Lai

### Pre-commit Hook

Tạo file `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Check for potential secrets
if git diff --cached --name-only | xargs grep -E "eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|gsk_[A-Za-z0-9]{32,}|sk-[A-Za-z0-9]{32,}" ; then
    echo "❌ ERROR: Potential API key or JWT token detected!"
    echo "Please remove hardcoded credentials before committing."
    exit 1
fi

# Check for .env files
if git diff --cached --name-only | grep -E "\.env$|\.env\.local$|\.env\.production$" ; then
    echo "❌ ERROR: .env file detected in commit!"
    echo "Never commit .env files!"
    exit 1
fi

exit 0
```

Sau đó:
```bash
chmod +x .git/hooks/pre-commit
```

### GitHub Secret Scanning

1. Vào GitHub repo → Settings → Security → Code security and analysis
2. Enable "Secret scanning"
3. Enable "Push protection"

## 📞 Support

Nếu cần hỗ trợ:
- Supabase Support: https://supabase.com/support
- GitHub Security: https://docs.github.com/en/code-security

---

**Created:** October 2025  
**Status:** 🚨 ACTIVE INCIDENT - Cần xử lý ngay!
