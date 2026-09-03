import React from 'react';
import { GraduationCap, School, Check, ArrowRight, BarChart3, Users, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const DualPersonas: React.FC = () => {
  return (
    <section id="personas" className="py-20 bg-muted/30 border-y border-border/60">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 px-3 py-1 bg-primary/10 text-primary border-primary/20 font-semibold">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Hệ Sinh Thái Song Hành
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Thiết kế chuyên biệt cho cả Học viên & Giáo viên
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Dù bạn đang tự ôn thi để nộp hồ sơ tốt nghiệp / xin việc, hay là giảng viên quản lý hàng trăm học viên, PrePro-TOEIC đều có giải pháp toàn diện.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Persona 1: Học viên */}
          <Card className="flex flex-col justify-between border-border hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                  Dành cho Học viên
                </Badge>
              </div>

              <CardTitle className="text-2xl font-bold text-foreground">
                Tự Học Thông Minh • Tối Đa Hóa Điểm Số
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Lộ trình cá nhân hóa, thi thử sát thực tế và loại bỏ điểm mù kiến thức.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              <ul className="space-y-3 text-sm text-foreground/85">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Thi thử full 200 câu:</strong> Bấm giờ 120 phút mô phỏng phòng thi thật tại IIG.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Ôn tập câu sai SM-2:</strong> Thuật toán tự lên lịch ôn lại trước khi quên.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Phân tích biểu đồ năng lực:</strong> Xem chi tiết tỷ lệ đúng theo từng Part và chủ điểm ngữ pháp.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Giải thích song ngữ:</strong> Hiểu rõ bản chất ngữ pháp và ngữ cảnh từ vựng kinh tế.</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-border/60">
                <Link to="/auth" className="block">
                  <Button className="w-full font-semibold bg-gradient-to-r from-blue-600 to-primary text-white shadow-sm">
                    Bắt đầu học miễn phí
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Persona 2: Giáo viên & Trung tâm */}
          <Card className="flex flex-col justify-between border-border hover:border-accent/50 transition-all duration-300 shadow-md hover:shadow-xl bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                  <School className="h-6 w-6" />
                </div>
                <Badge className="bg-accent/10 text-accent border-accent/20">
                  Dành cho Giáo viên & Trung tâm
                </Badge>
              </div>

              <CardTitle className="text-2xl font-bold text-foreground">
                Quản Lý Lớp Học • Soạn Đề Tự Động
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Giải phóng thời gian chấm bài và theo dõi sát sao tiến độ từng học sinh.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              <ul className="space-y-3 text-sm text-foreground/85">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Soạn đề thi bằng AI & Excel:</strong> Sinh đề trong 3 giây hoặc import ngân hàng câu hỏi qua file Excel mẫu.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Quản lý lớp học linh hoạt:</strong> Phân nhóm học sinh theo lớp, gán bài tập về nhà và đề kiểm tra định kỳ.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Hệ thống cảnh báo tự động (Alerts):</strong> Nhận thông báo khi học viên điểm thấp hoặc không hoạt động quá lâu.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Báo cáo hiệu suất trực quan:</strong> Xuất bảng điểm chi tiết, biểu đồ tiến bộ của cả lớp.</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-border/60">
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full font-semibold border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    Trải nghiệm cho Giảng dạy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
