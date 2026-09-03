import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  if (!password) return null;

  // Tính điểm độ mạnh mật khẩu (0 - 4)
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Rất yếu (tối thiểu 8 ký tự)', color: 'bg-red-500', textColor: 'text-red-500' },
    { label: 'Yếu (thêm chữ hoa hoặc số)', color: 'bg-amber-500', textColor: 'text-amber-500' },
    { label: 'Khá tốt', color: 'bg-blue-500', textColor: 'text-blue-500' },
    { label: 'Rất mạnh (bảo mật tối đa)', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  ];

  const currentLevel = levels[Math.max(0, score - 1)];

  return (
    <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
      {/* 4 thanh đo trực quan */}
      <div className="flex gap-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-full flex-1 rounded-full transition-all duration-300 ${
              index < score ? currentLevel.color : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Label phản hồi */}
      <div className="flex justify-between items-center text-[11px]">
        <span className={`font-semibold flex items-center gap-1 ${currentLevel.textColor}`}>
          {score >= 3 ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
          {currentLevel.label}
        </span>
        <span className="text-muted-foreground text-[10px]">
          {password.length >= 8 ? '✓ 8+ ký tự' : 'Cần 8+ ký tự'}
        </span>
      </div>
    </div>
  );
};
