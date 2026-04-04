import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

interface EditProfileDialogProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileDialog = ({ profile, open, onOpenChange }: EditProfileDialogProps) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.profile_picture);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: profile.full_name,
    headline: profile.headline ?? '',
    bio: profile.bio ?? '',
    location: profile.location ?? '',
    website: profile.website ?? '',
    cover_color: profile.cover_color ?? 'hsl(168, 32%, 32%)',
  });
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB');
      return;
    }
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let profile_picture = profile.profile_picture;

    if (pendingFile) {
      setUploading(true);
      const ext = pendingFile.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, pendingFile, { upsert: true });
      setUploading(false);
      if (uploadErr) {
        toast.error('Upload failed: ' + uploadErr.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      profile_picture = urlData.publicUrl + '?t=' + Date.now();
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...form, profile_picture })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Profile updated');
    qc.invalidateQueries({ queryKey: ['profile'] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <Avatar className="w-20 h-20 rounded-2xl">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt={form.full_name} />
                ) : null}
                <AvatarFallback className="rounded-2xl text-lg font-bold bg-primary/10 text-primary">
                  {getInitials(form.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Profile picture</p>
              <p>Click to upload (max 2 MB)</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <div>
            <Label>Full Name</Label>
            <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} />
          </div>
          <div>
            <Label>Headline</Label>
            <Input value={form.headline} onChange={e => update('headline', e.target.value)} placeholder="e.g. Software Engineer" />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => update('location', e.target.value)} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={e => update('website', e.target.value)} placeholder="example.com" />
            </div>
          </div>
          <div>
            <Label>Cover Color (HSL)</Label>
            <Input value={form.cover_color} onChange={e => update('cover_color', e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
