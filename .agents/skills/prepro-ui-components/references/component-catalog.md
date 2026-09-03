# Component Catalog — PrePro-TOEIC

## Business Components (`src/components/`)

### Exam Flow
| Component | File | Mô tả |
|-----------|------|--------|
| `ExamSession` | ExamSession.tsx (78KB) | Giao diện làm bài thi (legacy) |
| `ExamSessionWithAutoSave` | ExamSessionWithAutoSave.tsx | Exam session + auto save |
| `ExamResult` | ExamResult.tsx (46KB) | Kết quả thi chi tiết |
| `ExamReview` | ExamReview.tsx (41KB) | Xem lại bài thi |
| `ExamHistory` | ExamHistory.tsx | Lịch sử thi |
| `ExamHistoryTable` | ExamHistoryTable.tsx | Table lịch sử thi |
| `ExamPartSelection` | ExamPartSelection.tsx | Chọn parts để luyện |
| `ExamPreview` | ExamPreview.tsx | Preview đề thi |
| `ExitConfirmationDialog` | ExitConfirmationDialog.tsx | Xác nhận thoát bài thi |
| `RetryMode` | RetryMode.tsx | Làm lại bài thi |

### Question Management
| Component | File | Mô tả |
|-----------|------|--------|
| `QuestionGenerator` | QuestionGenerator.tsx (76KB) | AI question generator UI |
| `TOEICQuestionCreator` | TOEICQuestionCreator.tsx | Form tạo câu hỏi TOEIC |
| `TOEICQuestionManager` | TOEICQuestionManager.tsx | Quản lý câu hỏi TOEIC |
| `TOEICBulkUpload` | TOEICBulkUpload.tsx | Import câu hỏi từ Excel |
| `AddQuestionForm` | AddQuestionForm.tsx | Form thêm câu hỏi |
| `EditQuestion` | EditQuestion.tsx | Form sửa câu hỏi |
| `QuestionAssignment` | QuestionAssignment.tsx | Gán câu hỏi vào đề |
| `QuestionDetailModal` | QuestionDetailModal.tsx | Chi tiết câu hỏi |
| `OptimizedQuestionCreator` | OptimizedQuestionCreator.tsx | Tạo câu hỏi tối ưu |
| `PassageManager` | PassageManager.tsx (54KB) | Quản lý đoạn văn |
| `PassageDisplay` | PassageDisplay.tsx | Hiển thị đoạn văn |

### Exam Set Management
| Component | File | Mô tả |
|-----------|------|--------|
| `EnhancedExamSetCreator` | EnhancedExamSetCreator.tsx (43KB) | Wizard tạo đề thi |
| `WizardExamSetCreator` | WizardExamSetCreator.tsx | Step-by-step tạo đề |
| `ExamSetManagement` | ExamSetManagement.tsx | Quản lý danh sách đề |
| `ExamQuestionManagement` | ExamQuestionManagement.tsx | Quản lý câu hỏi trong đề |
| `ExamManagementDashboard` | ExamManagementDashboard.tsx | Dashboard quản lý đề |
| `PartsConfiguration` | PartsConfiguration.tsx | Cấu hình parts trong đề |
| `QuestionBankSetup` | QuestionBankSetup.tsx | Setup ngân hàng câu hỏi |

### Student Management
| Component | File | Mô tả |
|-----------|------|--------|
| `StudentManagement` | StudentManagement.tsx | Quản lý học viên |
| `StudentListWithFilters` | StudentListWithFilters.tsx (28KB) | DS học viên + filter |
| `StudentDetailModal` | StudentDetailModal.tsx | Chi tiết học viên |
| `StudentExamResults` | StudentExamResults.tsx | Kết quả thi của học viên |
| `ClassManagement` | ClassManagement.tsx | Quản lý lớp học |
| `RoleManagement` | RoleManagement.tsx | Phân quyền |

### Analytics & Reports
| Component | File | Mô tả |
|-----------|------|--------|
| `TeacherAnalytics` | TeacherAnalytics.tsx | Analytics cho giáo viên |
| `PerformanceDashboard` | PerformanceDashboard.tsx | Dashboard hiệu suất |
| `EnhancedActivityTimeline` | EnhancedActivityTimeline.tsx | Timeline hoạt động |
| `AdvancedAlertsSystem` | AdvancedAlertsSystem.tsx | Hệ thống cảnh báo |
| `TimeStatistics` | TimeStatistics.tsx | Thống kê thời gian |

### Audio
| Component | File | Mô tả |
|-----------|------|--------|
| `AudioPlayer` | AudioPlayer.tsx | Player audio (full features) |
| `SimpleAudioPlayer` | SimpleAudioPlayer.tsx | Player audio (minimal) |
| `AudioUpload` | AudioUpload.tsx | Upload audio file |
| `AudioQuestionCreator` | AudioQuestionCreator.tsx | Tạo câu hỏi có audio |

### Layout & Common
| Component | File | Mô tả |
|-----------|------|--------|
| `Layout` | Layout.tsx | Main layout wrapper |
| `ErrorBoundary` | ErrorBoundary.tsx | React error boundary |
| `NavigationDropdown` | NavigationDropdown.tsx | Navigation dropdown menu |
| `GrammarTopicsDisplay` | GrammarTopicsDisplay.tsx | Hiển thị chủ đề ngữ pháp |
| `BulkOperations` | BulkOperations.tsx | Bulk operations UI |

## MVC Components (`src/views/components/`)

Tổng cộng 24 MVC component pairs (MVC + View).
Xem `src/views/components/index.ts` để biết exports.

## Pages (`src/pages/`)

| Page | Route | Mô tả |
|------|-------|--------|
| `Index` | `/` | Landing page |
| `Auth` | `/auth` | Login/Register |
| `Dashboard` | `/dashboard` | Main dashboard |
| `QuestionManagement` | `/questions` | Quản lý câu hỏi |
| `QuestionGeneratorPage` | `/question-generator` | AI generator |
| `ExamSets` | `/exam-sets` | Danh sách đề thi |
| `ExamSelection` | `/exam-selection` | Chọn đề thi |
| `ExamCustomize` | `/exam-sets/:id/customize` | Tùy chỉnh đề |
| `ExamSession` | `/exam-session/:id` | Làm bài thi |
| `ExamReview` | `/exam-review/:sessionId` | Xem lại bài |
| `Review` | `/review` | Ôn tập (spaced repetition) |
| `Analytics` | `/analytics` | Analytics |
| `Settings` | `/settings` | Cài đặt |
| `NotFound` | `*` | 404 page |
