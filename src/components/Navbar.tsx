import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, PenLine, LogIn, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query'; // Add this
import { supabase } from '@/integrations/supabase/client'; // Add this

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const Navbar = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  // 1. Root Fix: Check for unread MESSAGES
  const { data: unreadMessagesCount = 0 } = useQuery({
    queryKey: ['unread-messages-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id)
        .eq('is_read', false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds to stay in sync
  });

  // 2. Root Fix: Check for unread NOTIFICATIONS
  const { data: unreadNotifsCount = 0 } = useQuery({
    queryKey: ['unread-notifications-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('notifications' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-serif text-xl font-bold tracking-tight text-foreground">
            Nexus
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <NavItem to="/" label="Feed" active={location.pathname === '/'} />
            {user && profile && (
              <NavItem to={`/profile/${profile.username}`} label="Profile" active={location.pathname.startsWith('/profile')} />
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Messages Link - Dynamic Dot */}
              <Link 
                to="/messages" 
                className={cn(
                  "p-2 rounded-lg transition-colors relative",
                  location.pathname.startsWith('/messages') ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Messages"
              >
                <MessageSquare className="w-[18px] h-[18px]" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Link>

              {/* Notifications Link - Dynamic Dot */}
              <Link 
                to="/notifications" 
                className={cn(
                  "p-2 rounded-lg transition-colors relative",
                  location.pathname === '/notifications' ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                )}
              </Link>

              <Link
                to="/editor"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all"
              >
                <PenLine className="w-3.5 h-3.5" />
                Write
              </Link>

              <button
                onClick={() => signOut()}
                className="ml-1 w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Sign out"
              >
                {profile ? getInitials(profile.full_name) : '?'}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
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