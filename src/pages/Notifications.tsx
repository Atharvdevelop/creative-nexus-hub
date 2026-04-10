import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Bell, UserPlus, Heart, MessageSquare } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching notifications:", error);
      } else if (data) {
        setNotifications(data);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          // Double check the user_id matches the logged-in user
          if (payload.new.user_id === user.id && !payload.new.is_read) {
            setNotifications((prev) => [payload.new, ...prev]);
            
            // Refresh Navbar counts
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications' as any)
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      // 1. Remove from local list
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // 2. ROOT LEVEL REFRESH: Force all badges to update
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      queryClient.refetchQueries({ queryKey: ['conversations'] });
      
      console.log("Root level sync complete. Sidebar and Navbar updated!");
    } else {
      console.error("Error marking notification as read:", error);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
      Please sign in to view notifications.
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold font-serif tracking-tight">Notifications</h1>
        </div>
        {notifications.length > 0 && (
          <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full animate-pulse">
            {notifications.length} New
          </span>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-muted rounded-2xl">
            <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground italic font-medium font-serif">You're all caught up, Atharv!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => markAsRead(n.id)}
              className="p-4 bg-card border border-border rounded-xl cursor-pointer transition-all hover:shadow-md hover:border-primary/50 flex items-center gap-4 group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              
              <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                {n.type === 'follow' && <UserPlus className="w-5 h-5 text-blue-500" />}
                {n.type === 'like' && <Heart className="w-5 h-5 text-red-500" />}
                {n.type === 'message' && <MessageSquare className="w-5 h-5 text-green-500" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">
                   Someone <span className="font-normal text-muted-foreground">{n.content}</span>
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5 font-bold">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-primary font-bold uppercase">
                Mark Read
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;