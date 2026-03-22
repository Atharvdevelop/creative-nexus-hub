import { useParams } from 'react-router-dom';
import { useProfileByUsername } from '@/hooks/useProfile';
import { useUserPosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/ProfileHeader';
import BlogCard from '@/components/BlogCard';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { profile: currentProfile } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfileByUsername(username);
  const isOwn = currentProfile?.username === username;
  const { data: posts, isLoading: postsLoading } = useUserPosts(username, isOwn);

  if (profileLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-40 rounded-xl" />
        <div className="flex gap-4 px-6 -mt-12">
          <Skeleton className="w-28 h-28 rounded-2xl" />
          <div className="space-y-2 pt-14">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <ProfileHeader profile={profile} isOwnProfile={isOwn} />

      <div className="mt-10">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-6 animate-reveal-up" style={{ animationDelay: '200ms' }}>
          {isOwn ? 'Your Articles' : 'Articles'}
          <span className="text-muted-foreground font-normal text-base ml-2">{posts?.length ?? 0}</span>
        </h2>
        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="py-6 border-b space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div>
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i + 2} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-8 text-center">No articles yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
