import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeSwitcher } from './ThemeSwitcher';

interface LandingNavbarProps {
  onNavigateSection?: (sectionId: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onNavigateSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Tính Lộ Trình', href: '#calculator' },
    { label: 'Vũ Khí Độc Quyền', href: '#features' },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent shadow-md shadow-primary/20 text-white transition-all group-hover:shadow-primary/40">
            <Brain className="h-5 w-5 transition-transform group-hover:rotate-6" />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
                PrePro TOEIC
              </span>
              <Badge variant="secondary" className="text-[10px] font-semibold px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium -mt-1">Học thông minh • Nhớ dài lâu</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Light/Dark Mode Switcher */}
          <ThemeSwitcher />

          <Link to="/auth">
            <Button variant="ghost" size="sm" className="font-medium text-foreground hover:bg-muted/80">
              Đăng nhập
            </Button>
          </Link>
          <Link to="/auth">
            <Button 
              size="sm" 
              className="font-medium bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white shadow-sm shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02]"
            >
              Bắt đầu miễn phí
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-1.5">
          <ThemeSwitcher />
          <Link to="/auth">
            <Button size="sm" variant="default" className="text-xs px-2.5 h-8 bg-primary text-white">
              Bắt đầu
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center bg-gradient-to-r from-primary to-accent text-white shadow-sm">
                Bắt đầu học ngay
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
