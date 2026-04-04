import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePostLikes(postId: string | undefined) {
  return useQuery({
    queryKey: ['likes', postId],
    enabled: !!postId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId!);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useHasLiked(postId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['likes', postId, 'user', userId],
    enabled: !!postId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId!)
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

export function useToggleLike(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, liked }: { userId: string; liked: boolean }) => {
      if (liked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['likes', postId] });
      qc.invalidateQueries({ queryKey: ['likes', postId, 'user'] });
    },
  });
}
