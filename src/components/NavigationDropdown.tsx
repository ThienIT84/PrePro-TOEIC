import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

interface NavigationDropdownProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
  isActive: boolean;
}

const NavigationDropdown: React.FC<NavigationDropdownProps> = ({
  title,
  icon: Icon,
  items,
  isActive
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="flex-1 text-left">{title}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm ${
                item.active ? 'bg-accent text-accent-foreground' : ''
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavigationDropdown;


