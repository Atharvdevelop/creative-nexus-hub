import { useParams } from 'react-router-dom';
import { mockUsers, mockPosts, currentUser } from '@/lib/mockData';
import ProfileHeader from '@/components/ProfileHeader';
import BlogCard from '@/components/BlogCard';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const profile = mockUsers.find(u => u.username === username) ?? currentUser;
  const isOwn = profile.username === currentUser.username;
  const posts = mockPosts.filter(p => {
    if (p.author.username !== profile.username) return false;
    return isOwn ? true : p.status === 'published';
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <ProfileHeader profile={profile} isOwnProfile={isOwn} />

      <div className="mt-10">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-6 animate-reveal-up" style={{ animationDelay: '200ms' }}>
          {isOwn ? 'Your Articles' : 'Articles'}
          <span className="text-muted-foreground font-normal text-base ml-2">{posts.length}</span>
        </h2>
        {posts.length > 0 ? (
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
