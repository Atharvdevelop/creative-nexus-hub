import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, PenLine } from 'lucide-react';
import { currentUser, getInitials } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-serif text-xl font-bold tracking-tight text-foreground">
            Nexus
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <NavItem to="/" label="Feed" active={location.pathname === '/'} />
            <NavItem to={`/profile/${currentUser.username}`} label="Profile" active={location.pathname.startsWith('/profile')} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Search className="w-[18px] h-[18px]" />
          </button>
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
          <Link
            to="/editor"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all"
          >
            <PenLine className="w-3.5 h-3.5" />
            Write
          </Link>
          <Link to={`/profile/${currentUser.username}`} className="ml-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
              {getInitials(currentUser.fullName)}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

function NavItem({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
        active ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {label}
    </Link>
  );
}

export default Navbar;
