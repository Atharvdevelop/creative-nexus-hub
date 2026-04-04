import { useState } from 'react';
import { MapPin, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import EditProfileDialog from '@/components/EditProfileDialog';
import type { Tables } from '@/integrations/supabase/types';

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
  return (
    <div className="animate-reveal-up">
      <div
        className="h-32 sm:h-40 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${profile.cover_color ?? 'hsl(168,32%,32%)'}, ${profile.cover_color ?? 'hsl(168,32%,32%)'}88)` }}
      />

      <div className="px-4 sm:px-6 -mt-12 sm:-mt-14">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center text-2xl font-bold text-primary">
            {getInitials(profile.full_name)}
          </div>

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
                  <Button size="sm">Follow</Button>
                  <Button variant="outline" size="sm">Message</Button>
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
