import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { ScrollProgressBar } from '@/components/landing/ScrollProgressBar';
import { LandingHero } from '@/components/landing/LandingHero';
import { RunningAnnouncementTicker } from '@/components/landing/RunningAnnouncementTicker';
import { InteractiveScoreCalculator } from '@/components/landing/InteractiveScoreCalculator';
import { BentoFeatures } from '@/components/landing/BentoFeatures';
import { ConversionCTA } from '@/components/landing/ConversionCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

/**
 * High-Converting Streamlined Landing Page
 * Cấu trúc 4 Khối Vàng (The 4 Aha! Blocks) tập trung 100% vào giá trị và chuyển đổi:
 * 1. Hero & Live Test Drive (Aha! #1: Thấy ngay AI bóc tách bẫy câu hỏi)
 * 2. Score & Timeline Calculator (Aha! #2: Thấy ngay số ngày & lộ trình cá nhân hóa)
 * 3. The Bento Advantage (Aha! #3: 3 vũ khí độc quyền SM-2 + AI Llama + 4 Accents trong 1 khung)
 * 4. Final Conversion & Compact Footer (Tạo tài khoản miễn phí trong 30 giây)
 */
const Index: React.FC = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm font-medium">Đang tải PrePro-TOEIC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      {/* Scroll Progress Bar at very top */}
      <ScrollProgressBar />

      {/* Clean Navigation Header with Theme Switcher */}
      <LandingNavbar />

      <main className="flex-1">
        {/* Khối 1: Hero Section with 3D Tilt Interactive Quiz (Aha! #1) */}
        <LandingHero />

        {/* Dải tin chạy chữ ngang tự động từ trái sang phải */}
        <RunningAnnouncementTicker />

        {/* Khối 2: Interactive Goal & Study Timeline Calculator (Aha! #2) */}
        <InteractiveScoreCalculator />

        {/* Khối 3: Bento Grid - 3 Core Weapons: SM-2, AI, 4 Accents (Aha! #3) */}
        <BentoFeatures />

        {/* Khối 4: Final High-Impact Conversion Action Banner */}
        <ConversionCTA />
      </main>

      {/* Clean Compact Production Footer */}
      <LandingFooter />
    </div>
  );
};

export default Index;
