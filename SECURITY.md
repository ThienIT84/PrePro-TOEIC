# 🔒 Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email [your-email@example.com] instead of using the issue tracker.

## Security Best Practices

### Environment Variables

**NEVER commit these files:**
- `.env`
- `.env.local`
- `.env.production`
- Any file containing API keys or secrets

**Always use:**
- `.env.example` for documentation (with placeholder values)
- Environment variables for all sensitive data
- `.gitignore` to exclude `.env*` files

### API Keys

This project uses the following services that require API keys:

1. **Supabase** (Required)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Get from: https://app.supabase.com/project/_/settings/api

2. **Groq AI** (Optional)
   - `VITE_GROQ_API_KEY`
   - Get from: https://console.groq.com/keys

3. **HuggingFace** (Optional)
   - `VITE_HUGGINGFACE_API_KEY`
   - Get from: https://huggingface.co/settings/tokens

### If Credentials Are Compromised

If you accidentally commit credentials:

1. **Immediately rotate/regenerate** all exposed keys
2. **Remove from Git history** using:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch src/integrations/supabase/client.ts" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** to remote (if already pushed)
4. **Update** `.gitignore` to prevent future commits

### Supabase Security

- Enable Row Level Security (RLS) on all tables
- Use service role key only on backend/server
- Never expose service role key in frontend code
- Regularly review RLS policies
- Monitor usage in Supabase dashboard

### Production Deployment

Before deploying to production:

- [ ] Remove all `console.log` statements with sensitive data
- [ ] Set up environment variables in hosting platform
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Supabase RLS policies
- [ ] Review and test authentication flows

## Secure Development Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded credentials in source code
- [ ] All API keys use environment variables
- [ ] `.env.example` has placeholder values only
- [ ] Supabase RLS policies are enabled
- [ ] Authentication is properly implemented
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS prevention (React escapes by default)

## Dependencies

Keep dependencies up to date:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

## Contact

For security concerns, contact: [your-email@example.com]

---

**Last Updated:** October 2025
