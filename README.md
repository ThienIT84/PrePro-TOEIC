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

## ✨ Features

### 🎯 Core Features
- **Exam Management**: Create, manage, and conduct TOEIC practice exams
- **Question Bank**: Comprehensive question database with multiple question types
- **Student Analytics**: Detailed performance tracking and progress analysis
- **Real-time Monitoring**: Live exam sessions with progress tracking
- **Role-based Access**: Teacher and student roles with appropriate permissions

### 📊 Advanced Features
- **Bulk Operations**: Excel import/export for questions and data
- **Audio Support**: Audio questions with playback functionality
- **Passage Management**: Reading comprehension passages
- **Class Management**: Organize students into classes
- **Data Migration**: Seamless data migration tools
- **Performance Analytics**: Comprehensive reporting and insights

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

## 🛠️ Technologies Used

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Row Level Security** - Data Security

### Development Tools
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **Jest** - Testing Framework
- **Git** - Version Control

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
