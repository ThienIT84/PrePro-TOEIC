import React from 'react';
import { Brain, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur-sm py-10 text-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Purpose */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-white shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-foreground tracking-tight">
                PrePro TOEIC
              </span>
              <p className="text-xs text-muted-foreground">
                Luyện thi thông minh • Bứt phá 850+ cùng AI & Spaced Repetition (SM-2)
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="text-xs h-8 bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-sm">
                Tạo tài khoản miễn phí <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-border/50 mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} PrePro-TOEIC. Bản quyền thuộc về cộng đồng luyện thi TOEIC.</p>
          <p className="flex items-center gap-1">
            Đề thi cập nhật liên tục theo chuẩn ETS mới nhất
          </p>
        </div>
      </div>
    </footer>
  );
};
