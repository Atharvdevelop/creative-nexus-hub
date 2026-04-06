import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import EditProfileDialog from '@/components/EditProfileDialog';
import type { Tables } from '@/integrations/supabase/types';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Profile = Tables<'profiles'>;

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile?: boolean;
}

const ProfileHeader = ({ profile, isOwnProfile = false }: ProfileHeaderProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  // This check makes sure the button state is correct when the page loads
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (user && !isOwnProfile) {
        const { data } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
          .single();
        
        if (data) setIsFollowing(true);
      }
    };
    checkFollowStatus();
  }, [user, profile.id, isOwnProfile]);

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow");
      return;
    }

    if (isFollowing) {
      // Logic for Unfollowing
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profile.id);

      if (!error) {
        setIsFollowing(false);
        toast.info(`Unfollowed ${profile.full_name}`);
      }
      return;
    }

    // Logic for Following
    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: user.id, following_id: profile.id }]);

    if (error) {
      if (error.code === '23505') toast.info("You already follow this person");
      else toast.error(error.message);
    } else {
      setIsFollowing(true);
      toast.success(`You are now following ${profile.full_name}`);
    }
  };

  return (
    <div className="animate-reveal-up">
      <div
        className="h-32 sm:h-40 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${profile.cover_color ?? 'hsl(168,32%,32%)'}, ${profile.cover_color ?? 'hsl(168,32%,32%)'}88)` }}
      />

      <div className="px-4 sm:px-6 -mt-12 sm:-mt-14">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <Avatar className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-card shadow-lg">
            {profile.profile_picture ? (
              <AvatarImage src={profile.profile_picture} alt={profile.full_name} className="object-cover" />
            ) : null}
            <AvatarFallback className="rounded-2xl text-2xl font-bold bg-primary/10 text-primary">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">{profile.full_name}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">{profile.headline}</p>
              </div>
              {isOwnProfile ? (
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleFollow}
                    variant={isFollowing ? "secondary" : "default"}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/messages/${profile.username}`)}>Message</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-sm text-text-caption">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {profile.location}
            </span>
          )}
          {profile.website && (
            <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-text-link hover:underline underline-offset-2">
              <LinkIcon className="w-3.5 h-3.5" /> {profile.website}
            </a>
          )}
        </div>

        {profile.bio && (
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/85 max-w-2xl text-pretty">
            {profile.bio}
          </p>
        )}
      </div>
      {isOwnProfile && (
        <EditProfileDialog profile={profile} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </div>
  );
};

export default ProfileHeader;