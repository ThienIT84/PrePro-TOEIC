import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowLeft, GraduationCap, School } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { ThemeSwitcher } from "@/components/landing/ThemeSwitcher";
import { translateAuthError } from "@/utils/authErrorTranslator";

export const Auth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [targetScore, setTargetScore] = useState<number>(850);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const { signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Đăng nhập không thành công",
        description: translateAuthError(error),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Chào mừng bạn trở lại!",
        description: "Đăng nhập thành công vào PrePro-TOEIC.",
      });
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const { error } = await signUp(email, password, name, role, targetScore);

    if (error) {
      toast({
        title: "Đăng ký chưa thành công",
        description: translateAuthError(error),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tạo tài khoản thành công!",
        description: "Vui lòng kiểm tra email để kích hoạt tài khoản.",
      });
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-sm font-medium">Đang khởi tạo PrePro-TOEIC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center selection:bg-primary/20">
      {/* Main Split Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Column: Interactive Auth Form */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative">
          {/* Top Bar: Navigation & Theme Switcher */}
          <div className="flex items-center justify-between pb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Quay lại trang chủ</span>
            </Link>
            <ThemeSwitcher />
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md mx-auto space-y-6 my-auto py-4">
            {/* Brand Title */}
            <div className="space-y-2 text-left">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center shadow-md shadow-primary/20">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight text-foreground block">
                    PrePro TOEIC
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium -mt-1 block">
                    Luyện thi thông minh • Chuẩn ETS 2026
                  </span>
                </div>
              </Link>
            </div>

            {/* Tabs Controller */}
            <Tabs defaultValue="signin" className="w-full space-y-5">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60 rounded-xl">
                <TabsTrigger value="signin" className="rounded-lg text-xs font-bold py-2">
                  Đăng Nhập
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg text-xs font-bold py-2">
                  Đăng Ký Tài Khoản
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: SIGN IN FORM */}
              <TabsContent value="signin" className="space-y-4 pt-1 animate-in fade-in duration-200">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-xs font-semibold text-foreground">
                      Địa chỉ Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        className="pl-10 h-11 text-sm rounded-xl"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="signin-password" className="text-xs font-semibold text-foreground">
                        Mật khẩu
                      </Label>
                      <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11 text-sm rounded-xl"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20 hover:scale-[1.01] transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Đang xác thực...</span>
                      </div>
                    ) : (
                      "Đăng Nhập"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* TAB 2: SIGN UP FORM */}
              <TabsContent value="signup" className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Role Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">Bạn tham gia với tư cách:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        role === "student"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span>Học Viên</span>
                      </div>
                      <span className="text-[10px] block text-muted-foreground mt-0.5">Luyện thi đạt 850+</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("teacher")}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        role === "teacher"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 shadow-xs"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <School className="h-4 w-4 text-emerald-600" />
                        <span>Giáo Viên</span>
                      </div>
                      <span className="text-[10px] block text-muted-foreground mt-0.5">Tạo đề & Quản lý lớp</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-xs font-semibold text-foreground">
                      Họ và tên
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        className="pl-10 h-10 text-sm rounded-xl"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs font-semibold text-foreground">
                      Địa chỉ Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        className="pl-10 h-10 text-sm rounded-xl"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Target Score Selector for Students */}
                  {role === "student" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Mục tiêu điểm thi:</Label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[500, 650, 850, 990].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setTargetScore(score)}
                            className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                              targetScore === score
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {score}+
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs font-semibold text-foreground">
                      Mật khẩu khởi tạo
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        className="pl-10 pr-10 h-10 text-sm rounded-xl"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        aria-label="Toggle password"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Interactive Realtime Password Strength Indicator */}
                    <PasswordStrengthIndicator password={signupPassword} />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20 hover:scale-[1.01] transition-all mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Đang tạo tài khoản...</span>
                      </div>
                    ) : (
                      "Tạo Tài Khoản Miễn Phí"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Bottom Security Note */}
          <div className="pt-6 text-center text-[11px] text-muted-foreground">
            <span>Bảo mật 100% theo tiêu chuẩn Supabase Auth & RLS Policy</span>
          </div>
        </div>

        {/* Right Column: Immersive Brand Showcase */}
        <div className="lg:col-span-5 xl:col-span-6">
          <AuthShowcase />
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={forgotEmail}
      />
    </div>
  );
};

export default Auth;
