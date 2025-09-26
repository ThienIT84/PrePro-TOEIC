import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  BookOpen, 
  RotateCcw, 
  BarChart3, 
  Settings, 
  LogOut,
  Brain,
  Globe
} from 'lucide-react';
import { t, getLanguage, setLanguage } from '@/lib/i18n';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const currentLang = getLanguage();

  const navigation = [
    { 
      name: t('nav.dashboard'), 
      href: '/dashboard', 
      icon: LayoutDashboard,
      active: location.pathname === '/dashboard'
    },
    { 
      name: t('nav.drills'), 
      href: '/drills', 
      icon: BookOpen,
      active: location.pathname.startsWith('/drills')
    },
    { 
      name: t('nav.review'), 
      href: '/review', 
      icon: RotateCcw,
      active: location.pathname === '/review'
    },
    { 
      name: t('nav.analytics'), 
      href: '/analytics', 
      icon: BarChart3,
      active: location.pathname === '/analytics'
    },
    { 
      name: t('nav.settings'), 
      href: '/settings', 
      icon: Settings,
      active: location.pathname === '/settings'
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleLanguage = () => {
    const newLang = currentLang === 'vi' ? 'en' : 'vi';
    setLanguage(newLang);
    window.location.reload(); // Simple way to re-render with new translations
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TOEIC Master
              </h1>
              <p className="text-xs text-muted-foreground">AI TOEIC Coach</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {profile?.name?.charAt(0) || user?.email?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Mục tiêu: {profile?.target_score || 700}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex-1"
            >
              <Globe className="h-3 w-3 mr-1" />
              {currentLang.toUpperCase()}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex-1"
            >
              <LogOut className="h-3 w-3 mr-1" />
              {t('auth.sign_out')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;