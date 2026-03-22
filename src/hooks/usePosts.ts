import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;
type Profile = Tables<'profiles'>;

export type PostWithAuthor = BlogPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'headline' | 'profile_picture'>;
};

export function usePublishedPosts() {
  return useQuery({
    queryKey: ['posts', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles!blog_posts_author_id_fkey(username, full_name, headline, profile_picture)')
        .eq('status', 'published')
        .order('published_date', { ascending: false });
      if (error) throw error;
      return data as PostWithAuthor[];
    },
  });
}

export function usePostBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['posts', 'slug', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles!blog_posts_author_id_fkey(username, full_name, headline, profile_picture)')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data as PostWithAuthor;
    },
  });
}

export function useUserPosts(username: string | undefined, includesDrafts: boolean) {
  return useQuery({
    queryKey: ['posts', 'user', username, includesDrafts],
    enabled: !!username,
    queryFn: async () => {
      // First get the profile to find user_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username!)
        .single();
      if (!profile) return [];

      let query = supabase
        .from('blog_posts')
        .select('*, profiles!blog_posts_author_id_fkey(username, full_name, headline, profile_picture)')
        .eq('author_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (!includesDrafts) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PostWithAuthor[];
    },
  });
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36);
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; content: string; status: 'draft' | 'published'; tags?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const slug = slugify(input.title);
      const excerpt = input.content.replace(/[#>*_`\-\n]/g, ' ').trim().slice(0, 200);
      const readTime = estimateReadTime(input.content);

      const row: TablesInsert<'blog_posts'> = {
        author_id: user.id,
        title: input.title,
        slug,
        content: input.content,
        excerpt,
        status: input.status,
        read_time: readTime,
        tags: input.tags ?? [],
        published_date: input.status === 'published' ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase.from('blog_posts').insert(row).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
