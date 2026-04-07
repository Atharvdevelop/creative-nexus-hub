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
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      if (data) setNotifications(data);
    };

    fetchNotifications();

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    }
  };

  if (!user) return <div className="p-8 text-center text-muted-foreground">Please sign in to view notifications.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold font-serif">Notifications</h1>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground italic">You're all caught up, Atharv!</p>
          </div>
        )}

        {notifications.map((n) => (
          <div 
            key={n.id} 
            onClick={() => markAsRead(n.id)}
            className="p-4 bg-card border border-border rounded-xl cursor-pointer transition-all hover:shadow-md hover:border-primary/50 flex items-center gap-4 group"
          >
            <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10">
              {n.type === 'follow' && <UserPlus className="w-5 h-5 text-blue-500" />}
              {n.type === 'like' && <Heart className="w-5 h-5 text-red-500" />}
              {n.type === 'message' && <MessageSquare className="w-5 h-5 text-green-500" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                Someone <span className="font-normal text-muted-foreground">{n.content}</span>
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;