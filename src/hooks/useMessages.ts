import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Profile {
  user_id: string;
  username: string;
  full_name: string;
  profile_picture: string | null;
}

export interface Conversation {
  partner: Profile;
  lastMessage: Message;
  unreadCount: number;
}

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const partnerIds = new Set<string>();
      const grouped = new Map<string, Message[]>();
      for (const m of (messages ?? []) as Message[]) {
        const pid = m.sender_id === userId ? m.receiver_id : m.sender_id;
        partnerIds.add(pid);
        if (!grouped.has(pid)) grouped.set(pid, []);
        grouped.get(pid)!.push(m);
      }

      if (partnerIds.size === 0) return [] as Conversation[];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, profile_picture')
        .in('user_id', [...partnerIds]);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) ?? []);

      const convos: Conversation[] = [];
      for (const [pid, msgs] of grouped) {
        const partner = profileMap.get(pid);
        if (!partner) continue;
        convos.push({
          partner,
          lastMessage: msgs[0],
          unreadCount: msgs.filter(m => m.receiver_id === userId && !m.is_read).length,
        });
      }
      return convos.sort((a, b) =>
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
    },
  });
}

export function useDirectMessages(userId: string | undefined, partnerId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['dm', userId, partnerId],
    enabled: !!userId && !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
        )
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });

  useEffect(() => {
    if (!userId || !partnerId) return;
    const channel = supabase
      .channel(`dm-${userId}-${partnerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === userId && msg.receiver_id === partnerId) ||
          (msg.sender_id === partnerId && msg.receiver_id === userId)
        ) {
          qc.setQueryData<Message[]>(['dm', userId, partnerId], (old) => [...(old ?? []), msg]);
          qc.invalidateQueries({ queryKey: ['conversations'] });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, partnerId, qc]);

  return query;
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ senderId, receiverId, content }: { senderId: string; receiverId: string; content: string }) => {
      const { error } = await supabase.from('messages').insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: async ({ visibleIds }: { visibleIds: string[] }) => {
      if (visibleIds.length === 0) return;
      await supabase.from('messages').update({ is_read: true }).in('id', visibleIds);
    },
  });
}
