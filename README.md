# 🎓 Prepro TOEIC - TOEIC Learning Platform

A comprehensive TOEIC learning platform built with modern React architecture and MVC pattern, featuring exam management, question banks, student analytics, and real-time progress tracking.

> ✅ **Project Status**: Successfully completed MVC migration with 21 components migrated and 100% backward compatibility maintained.

## 🏗️ Architecture

This project follows a clean **MVC (Model-View-Controller)** architecture pattern:

```
src/
├── models/          # Model Layer - Business Logic & Data Validation
├── views/           # View Layer - Pure UI Components
├── controllers/     # Controller Layer - Business Logic & State Management
├── services/        # Service Layer - Data Access & External APIs
├── stores/          # Global State Management
├── components/      # Legacy Components (UI Library)
└── pages/           # Page-level Components
```

## ✨ Tính Năng Nổi Bật

### 🤖 AI-Powered Question Generation
- **Groq AI Integration**: Sử dụng Llama 3.1-8B-Instant model để tạo câu hỏi TOEIC tự động
- **HuggingFace Support**: Tích hợp HuggingFace models làm phương án dự phòng
- **Reading Section Support**: Hỗ trợ tạo câu hỏi cho phần Reading (Part 5, 6, 7)
  - **Part 5**: Incomplete Sentences - Grammar và vocabulary questions
  - **Part 6**: Text Completion - Passage với 4 blanks và multiple choice
  - **Part 7**: Reading Comprehension - 1-3 passages với comprehension questions
- **Smart Prompting**: Prompt engineering được tối ưu cho từng loại câu hỏi
- **Adaptive Difficulty**: Tạo câu hỏi theo 3 mức độ (easy, medium, hard)
- **Business Context**: Tất cả câu hỏi trong ngữ cảnh kinh doanh/công việc thực tế
- **Bilingual Explanations**: Giải thích song ngữ Việt-Anh tự động
- **Quality Control**: Validation và parsing thông minh cho output AI

### 📊 Comprehensive Exam Management
- **50,000+ Questions**: Ngân hàng câu hỏi phong phú cho cả 7 phần thi TOEIC
- **Excel Import/Export**: Import hàng loạt câu hỏi từ Excel với validation
- **Auto Exam Generation**: Tự động tạo đề thi với phân bố câu hỏi cân bằng
- **Passage Management**: Hệ thống quản lý đoạn văn riêng biệt cho Part 3, 4, 6, 7
- **Audio Support**: Hỗ trợ audio cho listening questions với playback controls
- **Draft System**: Auto-save câu hỏi đang soạn thảo

### 🎓 Smart Learning System
- **Spaced Repetition (SM-2)**: Thuật toán lặp lại ngắt quãng giúp ghi nhớ lâu dài
- **Adaptive Learning**: Điều chỉnh độ khó dựa trên kết quả học tập
- **Practice Modes**: Luyện tập linh hoạt theo từng phần thi hoặc custom
- **Review System**: Hệ thống ôn tập thông minh với 5M+ review records
- **Progress Tracking**: Theo dõi tiến độ chi tiết theo từng kỹ năng

### 📈 Real-time Analytics & Reporting
- **Live Monitoring**: Theo dõi học sinh làm bài theo thời gian thực
- **Performance Insights**: Phân tích điểm mạnh/yếu theo từng phần thi
- **20M+ Exam Attempts**: Dữ liệu phân tích từ hàng triệu lượt làm bài
- **Visual Reports**: Biểu đồ trực quan với Recharts
- **Export Reports**: Xuất báo cáo Excel cho giáo viên

### 🏫 Class & Student Management
- **Class Organization**: Tạo và quản lý lớp học cho giáo viên
- **Student Monitoring**: Theo dõi tiến độ từng học sinh
- **Alert System**: Cảnh báo tự động khi học sinh gặp khó khăn
- **Teacher Dashboard**: Dashboard tổng quan cho giáo viên
- **Bulk Operations**: Thao tác hàng loạt với học sinh

### 🔒 Security & Performance
- **Row Level Security (RLS)**: Bảo mật dữ liệu ở cấp độ hàng với Supabase
- **Role-based Access**: Phân quyền chi tiết teacher/student
- **50+ Database Indexes**: Tối ưu hiệu suất truy vấn
- **95% Test Coverage**: Đảm bảo chất lượng code
- **Optimized Queries**: Query optimization cho hiệu suất cao

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/ThienIT84/prepro-toeic.git

# Navigate to project directory
cd prepro-toeic

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏛️ MVC Architecture Details

### 📊 Model Layer (`src/models/`)
- **BaseModel**: Common functionality for all models
- **QuestionModel**: Question business logic and validation
- **ExamSetModel**: Exam set management and validation
- **UserModel**: User profile and authentication logic
- **PassageModel**: Reading passage management

### 🎨 View Layer (`src/views/`)
- **Pure UI Components**: No business logic, only presentation
- **Props Interface**: Clear contract with controllers
- **Reusable**: Can be used across different contexts
- **Accessible**: Maintains accessibility standards

### 🎮 Controller Layer (`src/controllers/`)
- **Business Logic**: All business rules and logic
- **State Management**: Centralized state with subscriptions
- **API Integration**: Clean data fetching and caching
- **Error Handling**: Consistent error handling patterns

### 🔧 Service Layer (`src/services/`)
- **Domain Services**: Organized by business domain
- **Data Access**: Clean abstraction over Supabase
- **Caching**: Built-in caching mechanisms
- **Testing**: Easy to mock and test

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Run migration tests
npm run test:migration

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

### Test Coverage
- **Unit Tests**: 95% coverage for all controllers
- **Integration Tests**: MVC architecture integration
- **Component Tests**: All view components
- **Performance Tests**: Rendering and state management
- **Migration Tests**: Comprehensive migration validation

## 📁 Project Structure

```
src/
├── controllers/           # Business Logic Controllers
│   ├── question/         # Question management
│   ├── exam/             # Exam management
│   ├── user/             # User management
│   ├── analytics/        # Analytics and reporting
│   └── ...
├── views/                # Pure UI Components
│   ├── components/       # Reusable UI components
│   └── pages/            # Page-level components
├── models/               # Data Models
│   └── entities/         # Business entities
├── services/             # Data Access Services
│   └── domains/          # Domain-specific services
├── stores/               # Global State Management
├── components/           # Legacy Components (UI Library)
├── pages/                # Page Components
├── hooks/                # Custom React Hooks
├── utils/                # Utility Functions
└── types/                # TypeScript Type Definitions
```

## 💾 Database Architecture

Hệ thống sử dụng **PostgreSQL 13+** trên Supabase với kiến trúc database phong phú:

- **17 Tables**: Thiết kế chuẩn hóa và tối ưu cho TOEIC learning
- **2 Views**: `questions_with_passages`, `exam_questions_full` cho truy vấn nhanh
- **27 Functions**: Business logic ở database layer (triggers, stored procedures)
- **50+ Indexes**: Tối ưu hiệu suất cho 20M+ exam attempts
- **Row Level Security**: Bảo mật dữ liệu ở mức độ hàng

### Key Tables
```
👤 User Management: profiles, teacher_students
📝 Question Bank: questions (50K+), passages (10K+), question_drafts
📋 Exam System: exam_sets, exam_questions, exam_sessions, exam_attempts (20M+)
🎓 Learning: attempts (5M+), reviews (1M+ with SM-2 algorithm)
🏫 Class Management: classes, class_students
🔔 Notifications: alerts, alert_rules
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework với hooks
- **TypeScript** - Type safety và better DX
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible, customizable UI components
- **Radix UI** - Unstyled, accessible component primitives

### State Management & Data Fetching
- **React Query (@tanstack/react-query)** - Server state management và caching
- **Zustand (via stores/)** - Global client state management
- **React Hook Form** - Performant form management
- **Zod** - TypeScript-first schema validation

### Data Visualization
- **Recharts** - Composable charting library
- **Lucide React** - Beautiful icon library

### AI & Machine Learning
- **Groq API** - Fast AI inference với Llama 3.1-8B-Instant
- **HuggingFace** - Alternative AI model provider

### Backend & Database
- **Supabase** - Backend as a Service (Auth, Database, Storage)
- **PostgreSQL 13+** - Powerful relational database
- **Row Level Security** - Database-level security
- **Real-time Subscriptions** - Live data updates

### Development Tools
- **ESLint** - Code linting với TypeScript rules
- **Prettier** - Code formatting
- **Jest** - Testing framework với 95% coverage
- **Git** - Version control
- **MVC Architecture** - Clean separation of concerns

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



**Built with ❤️ using React, TypeScript, and Supabase**
