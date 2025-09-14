# Thesis Management System

Hệ thống quản lý khóa luận tốt nghiệp được xây dựng với React 18, TypeScript, và Ant Design.

## 🚀 Tính năng chính

- **Quản lý đề tài**: Tạo, duyệt, theo dõi đề tài khóa luận
- **Theo dõi tiến độ**: Timeline tiến độ với các mốc quan trọng
- **Nộp bài versioned**: Hỗ trợ nhiều phiên bản, lịch sử thay đổi
- **Hệ thống phản biện**: Quy trình đánh giá với logic reviewer
- **Chấm điểm tự động**: Tính điểm cuối với bonus từ HOD
- **Lịch trình**: Calendar tích hợp FullCalendar
- **Chat realtime**: Trao đổi theo từng đề tài
- **Báo cáo thống kê**: Dashboard và charts chi tiết
- **Phân quyền RBAC**: 8 vai trò với quyền hạn rõ ràng
- **Đa ngôn ngữ**: Hỗ trợ Tiếng Việt và English

## 🛠 Công nghệ sử dụng

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Ant Design 5
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Calendar**: FullCalendar
- **Charts**: Recharts
- **i18n**: react-i18next
- **Mock API**: MSW (Mock Service Worker)

## 📁 Cấu trúc dự án

\`\`\`
src/
├── app/                    # App configuration
│   ├── providers/         # Context providers
│   └── router.tsx         # Route configuration
├── shared/                # Shared utilities
│   ├── api/              # API client & MSW
│   ├── components/       # Reusable components
│   ├── lib/              # Utilities & RBAC
│   ├── types/            # TypeScript types
│   └── locales/          # i18n translations
├── entities/             # Business entities
├── features/             # Feature components
└── pages/                # Page components
\`\`\`

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 18
- npm >= 8

### Cài đặt dependencies
\`\`\`bash
npm install
\`\`\`

### Chạy development server
\`\`\`bash
npm run dev
\`\`\`

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Các lệnh khác
\`\`\`bash
# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Start MSW separately
npm run msw:start
\`\`\`

## 👥 Tài khoản demo

Hệ thống đã được seed với các tài khoản demo:

| Vai trò | Email | Mật khẩu | Mô tả |
|---------|-------|----------|-------|
| Admin | admin@university.edu.vn | password | Quản trị viên hệ thống |
| HOD | hod@university.edu.vn | password | Trưởng bộ môn |
| GVHD | supervisor1@university.edu.vn | password | Giảng viên hướng dẫn |
| GVPB | reviewer1@university.edu.vn | password | Giảng viên phản biện |
| Sinh viên | student1@student.university.edu.vn | password | Sinh viên |

## 🎯 Các vai trò và quyền hạn

### STUDENT (Sinh viên)
- Xem đề tài của mình
- Cập nhật tiến độ
- Nộp bài (versioned)
- Xem phản biện và điểm
- Tham gia chat

### SUPERVISOR (GVHD)
- Tạo và quản lý đề tài
- Phản hồi tiến độ sinh viên
- Chấm điểm giữa kỳ/cuối kỳ
- Tạo lịch báo cáo thử
- Đánh giá pre-assessment

### REVIEWER (GVPB)
- Xem đề tài được phân công
- Chấm điểm phản biện
- Tham gia họp đánh giá

### HOD (Trưởng bộ môn)
- Duyệt/sửa đề tài
- Phân công reviewer thứ 3
- Thưởng điểm (≤ 2.0)
- Xem báo cáo tổng quan
- Tạo lịch hội đồng

### ADMIN
- Quản lý người dùng
- Phân quyền
- Cấu hình hệ thống
- Quản lý rubric

## 📊 Dữ liệu mẫu

Hệ thống đã được seed với:
- 10 người dùng (các vai trò khác nhau)
- 3 đề tài ở các trạng thái khác nhau
- Tiến độ và milestone
- Bài nộp versioned
- Lịch trình và sự kiện
- Điểm số và đánh giá
- Thông báo

## 🔧 Tính năng đặc biệt

### 1. Topic Revision System
- HOD có thể sửa đề tài với versioning
- Lưu lịch sử thay đổi và lý do
- Auto revert status khi GVHD chỉnh sửa

### 2. Reviewer Logic
- 2 pass ⇒ pass
- 1 pass + 1 fail ⇒ reviewer thứ 3
- 2 fail ⇒ fail

### 3. Final Score Calculation
\`\`\`
Final Score = (GVHD + GVPB + Hội đồng) / 3
Total Score = Final Score + Bonus (≤ 2.0, chỉ khi Final ≥ threshold)
\`\`\`

### 4. Versioned Submissions
- Hỗ trợ nhiều loại file: PDF, DOCX, ZIP
- Lưu lịch sử versions
- Metadata và notes cho mỗi version

## 🌐 Đa ngôn ngữ

Hệ thống hỗ trợ:
- 🇻🇳 Tiếng Việt (mặc định)
- 🇺🇸 English

Chuyển đổi ngôn ngữ qua icon 🌐 trên header.

## 🧪 Testing

\`\`\`bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
\`\`\`

Đã có unit tests cho:
- `FinalScoreCalculator`
- `rbac.ts`
- Các component chính

## 📝 API Endpoints

Mock API endpoints (prefix `/api`):

\`\`\`
Auth:
POST /auth/login
POST /auth/logout

Users:
GET /users
GET /users/:id
POST /users
PUT /users/:id
DELETE /users/:id

Topics:
GET /topics
GET /topics/:id
POST /topics
PUT /topics/:id
GET /topics/:id/revisions
GET /topics/:id/progress
GET /topics/:id/submissions
GET /topics/:id/reviews
GET /topics/:id/schedule
GET /topics/:id/scoring/:type

Schedules:
GET /schedules
POST /schedules

Scoring:
GET /rubrics
GET /topics/:id/scoring/:type
POST /topics/:id/scoring/:type

Reports:
GET /reports/overview

Notifications:
GET /notifications
\`\`\`

## 🚧 Roadmap

### Phase 2
- [ ] Email notifications
- [ ] File preview trong browser
- [ ] Advanced search với Elasticsearch
- [ ] Real-time collaboration
- [ ] Mobile responsive improvements

### Phase 3
- [ ] Integration với LMS
- [ ] Plagiarism detection
- [ ] Advanced analytics
- [ ] Export templates
- [ ] Workflow automation

## 🐳 Deployment

### Docker Deployment

1. **Build và chạy với Docker:**
\`\`\`bash
# Build image
docker build -t thesis-management-system .

# Run container
docker run -p 80:80 thesis-management-system
\`\`\`

2. **Sử dụng Docker Compose:**
\`\`\`bash
docker-compose up -d
\`\`\`

### Production Deployment

1. **Chuẩn bị môi trường:**
\`\`\`bash
# Copy environment variables
cp .env.example .env

# Cập nhật các biến môi trường cần thiết
\`\`\`

2. **Build và deploy:**
\`\`\`bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Serve static files với nginx hoặc hosting service
\`\`\`

### CI/CD với GitHub Actions

Repository đã được cấu hình với GitHub Actions workflow:
- **Test**: Chạy linting, type checking, và unit tests
- **Build**: Build application và tạo artifacts
- **Deploy**: Deploy tự động khi push lên main branch

### Environment Variables

Tạo file `.env` từ `.env.example` và cập nhật:

\`\`\`bash
# Application
VITE_APP_TITLE=Hệ thống Quản lý Luận văn Thạc sĩ
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_SOCKET_URL=https://your-api-domain.com

# Features
VITE_ENABLE_MSW=false  # Disable in production
VITE_ENABLE_DEVTOOLS=false  # Disable in production

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=pdf,doc,docx,ppt,pptx,xls,xlsx

# Deployment
VITE_BASE_URL=/
\`\`\`

### Hosting Recommendations

**Recommended hosting platforms:**
- **Vercel**: Tối ưu cho React apps
- **Netlify**: Hỗ trợ tốt cho SPA
- **AWS S3 + CloudFront**: Scalable và cost-effective
- **Docker**: Flexible deployment trên bất kỳ platform nào

### Performance Optimization

Application đã được tối ưu với:
- **Code splitting**: Lazy loading cho routes
- **Bundle optimization**: Tree shaking và minification
- **Caching**: Static assets caching với nginx
- **Compression**: Gzip compression enabled
- **Security headers**: XSS protection và content security

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- Email: support@university.edu.vn
- Documentation: [Wiki](https://github.com/university/thesis-management/wiki)
- Issues: [GitHub Issues](https://github.com/university/thesis-management/issues)
