# 🎓 Prepro TOEIC - TOEIC Learning Management System

> A production-ready TOEIC learning platform with AI-powered question generation, comprehensive exam management, and real-time student analytics.

**Live Demo:** [Coming Soon] | **Status:** 85% Complete | **Type:** Full-stack Web Application

---

## � Project Overview

Enterprise-grade TOEIC learning platform designed for language schools and teachers to manage students, create exams, and track learning progress with intelligent analytics.

**Key Capabilities:**
- 🤖 AI-powered question generation (Groq/Llama 3.1)
- 📝 Complete exam lifecycle management (create, assign, grade, review)
- 📊 Real-time student performance analytics
- 🎓 Spaced repetition learning system (SM-2 algorithm)
- 🏫 Multi-class student management
- 📱 Responsive design for desktop and mobile

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** - Type-safe modern UI
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** + **shadcn/ui** - Beautiful, accessible components
- **React Query** - Smart data caching and state management
- **Recharts** - Data visualization

### Backend & Database
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **PostgreSQL 13+** - 17 tables, 50+ indexes, Row Level Security
- **Real-time subscriptions** - Live updates

### AI & Tools
- **Groq API** (Llama 3.1-8B) - Question generation
- **Excel Import/Export** - Bulk operations
- **Jest** - Testing framework

### Architecture
- **MVC Pattern** - Clean separation of concerns (migration in progress: 36%)
- **Repository Pattern** - Data access abstraction
- **Service Layer** - Business logic organization

---

## 📊 Project Status

| Category | Completion | Status |
|----------|------------|--------|
| **Core Features** | 95% | ✅ Production Ready |
| **Database Design** | 98% | ✅ Optimized |
| **UI/UX** | 88% | ✅ Polished |
| **Performance** | 90% | ✅ Optimized |
| **Architecture** | 75% | � MVC Migration (21/58 components) |
| **Testing** | 60% | 🚧 In Progress |
| **Documentation** | 85% | ✅ Comprehensive |
| **Overall** | **85%** | **✅ Production Ready** |

---

## ✨ Key Features

### For Teachers
- Create and manage question banks (7 TOEIC parts)
- Auto-generate exams with AI or manual selection
- Import/export questions via Excel
- Monitor student progress in real-time
- Automated alerts for struggling students
- Export performance reports

### For Students
- Take full TOEIC tests (200 questions, 120 minutes)
- Practice by specific parts or difficulty
- Review answers with detailed explanations
- Track progress with visual analytics
- Spaced repetition for optimal retention

### Technical Highlights
- **Query Optimization**: Reduced 7-14 queries → 1 query (85% faster)
- **Smart Caching**: React Query with 10-minute stale time
- **Security**: Row Level Security (RLS) at database level
- **Scalability**: Designed for 1000+ concurrent users

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/ThienIT84/prepro-toeic.git
cd prepro-toeic

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Start development server
npm run dev
```

**Environment Variables:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key (optional)
```

---

## 📁 Project Structure

```
src/
├── controllers/      # Business logic (21 controllers)
├── services/         # Data access layer
├── models/           # Data models & validation
├── views/            # Pure UI components (MVC pattern)
├── components/       # UI components (legacy + new)
├── pages/            # Route pages
├── hooks/            # Custom React hooks
└── types/            # TypeScript definitions

docs/                 # Technical documentation
├── DATABASE_DDL.sql
├── PERFORMANCE_OPTIMIZATION.md
└── TEST_CASES.md
```

---

## 🎯 Roadmap

### Current Focus (Q4 2025)
- [ ] Complete MVC migration (37 components remaining)
- [ ] Expand test coverage to 95%
- [ ] Production deployment preparation

### Future Enhancements (Q1 2026)
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Advanced AI features (adaptive difficulty)
- [ ] Multi-language support

---

## 💡 Why This Project Stands Out

1. **Production-Grade Architecture** - Clean MVC pattern, repository pattern, service layer
2. **Performance Optimized** - Smart caching, query optimization, 50+ database indexes
3. **AI Integration** - Real-world AI implementation with Groq/Llama 3.1
4. **Scalable Database** - PostgreSQL with RLS, triggers, and stored procedures
5. **Modern Stack** - Latest React 18, TypeScript, Vite, Supabase
6. **Real Business Value** - Solves actual problems for language schools

---

## 📝 Documentation

- [Database Schema](docs/DATABASE_DDL.sql) - Complete DDL with 17 tables
- [Performance Guide](docs/PERFORMANCE_OPTIMIZATION.md) - Query optimization techniques
- [Test Cases](docs/TEST_CASES.md) - 522 test scenarios documented

---

## 🤝 Contributing

This is a portfolio/learning project, but contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## � Contact

**Developer:** Tín (ThienIT84)  
**Email:** [Your Email]  
**LinkedIn:** [Your LinkedIn]  
**Portfolio:** [Your Portfolio]

---

**Built with ❤️ using React, TypeScript, and Supabase**

*Last Updated: October 2025*
