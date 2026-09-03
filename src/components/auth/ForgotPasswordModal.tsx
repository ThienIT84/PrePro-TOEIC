import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage('');

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMessage('Không thể gửi yêu cầu. Vui lòng kiểm tra lại email.');
      } else {
        setSentSuccess(true);
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSentSuccess(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-card border-border">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-xl font-bold text-foreground">
            Khôi Phục Mật Khẩu
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Nhập địa chỉ email tài khoản PrePro-TOEIC của bạn. Chúng tôi sẽ gửi một liên kết an toàn để bạn đặt lại mật khẩu mới.
          </DialogDescription>
        </DialogHeader>

        {sentSuccess ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Vui lòng kiểm tra hộp thư đến của <strong>{email}</strong> để đặt lại mật khẩu.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full h-10 font-semibold bg-primary text-white">
              Đã hiểu, quay lại Đăng nhập
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-xs font-semibold">Email tài khoản</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-9 h-10 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 h-10 text-xs">
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 h-10 text-xs font-bold bg-primary text-white">
                {loading ? 'Đang gửi...' : 'Gửi liên kết'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
