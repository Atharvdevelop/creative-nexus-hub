import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;
type Profile = Tables<'profiles'>;

export type PostWithAuthor = BlogPost & {
  author: Pick<Profile, 'username' | 'full_name' | 'headline' | 'profile_picture'> | null;
};

async function enrichPostsWithAuthors(posts: BlogPost[]): Promise<PostWithAuthor[]> {
  const authorIds = [...new Set(posts.map(p => p.author_id))];
  if (authorIds.length === 0) return posts.map(p => ({ ...p, author: null }));

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username, full_name, headline, profile_picture')
    .in('user_id', authorIds);

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) ?? []);

  return posts.map(post => ({
    ...post,
    author: profileMap.get(post.author_id) ?? null,
  }));
}

export function usePublishedPosts() {
  return useQuery({
    queryKey: ['posts', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_date', { ascending: false });
      if (error) throw error;
      return enrichPostsWithAuthors(data);
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
        .select('*')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      const [enriched] = await enrichPostsWithAuthors([data]);
      return enriched;
    },
  });
}

export function useUserPosts(username: string | undefined, includesDrafts: boolean) {
  return useQuery({
    queryKey: ['posts', 'user', username, includesDrafts],
    enabled: !!username,
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username!)
        .single();
      if (!profile) return [];

      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('author_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (!includesDrafts) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;
      if (error) throw error;
      return enrichPostsWithAuthors(data);
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
