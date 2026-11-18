import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, User } from '@/shared/components/animated-icons';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { useLinksStore } from '../stores/useLinksStore';
import { cn } from '@/shared/lib/utils';
import { Trans, useLingui } from '@lingui/react/macro';

interface ProfileEditorProps {
  onSave?: () => void;
}

/**
 * ProfileEditor - Customize profile information
 * 
 * Features:
 * - Avatar upload with initials placeholder
 * - Name input
 * - Bio textarea (max 80 chars)
 * - Theme color selector
 * - Real-time updates to store & preview
 */
export function ProfileEditor({ onSave }: ProfileEditorProps) {
  const { t } = useLingui();
  const { profile, updateProfile } = useLinksStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [charCount, setCharCount] = useState(profile.bio?.length || 0);

  // Theme colors for the phone mockup background
  const themeColors = [
    { name: 'Default', value: 'primary', class: 'bg-primary' },
    { name: 'Teal', value: 'accent-brand', class: 'bg-accent' },
    { name: 'Success', value: 'success', class: 'bg-success' },
    { name: 'Warning', value: 'warning', class: 'bg-warning' },
    { name: 'Purple', value: 'purple', class: 'bg-chart-3' },
    { name: 'Pink', value: 'pink', class: 'bg-chart-5' },
  ];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProfile({ name: e.target.value });
    onSave?.();
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 80) {
      updateProfile({ bio: value });
      setCharCount(value.length);
      onSave?.();
    }
  };

  const handleThemeChange = (themeColor: string) => {
    updateProfile({ themeColor });
    onSave?.();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      updateProfile({ avatar: objectUrl });
      onSave?.();
      
      // In production: Upload to server and get permanent URL
      // const uploadedUrl = await uploadAvatar(file);
      // updateProfile({ avatar: uploadedUrl });
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border-2 border-border rounded-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            <Trans>Profile</Trans>
          </h2>
          <p className="text-xs text-muted-foreground">
            <Trans>Personalize your bio link page</Trans>
          </p>
        </div>
      </div>

      {/* Avatar Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground"><Trans>Avatar</Trans></label>
        <div className="flex items-center gap-4">
          {/* Avatar Display */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors"
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-heading font-bold">
                {getInitials(profile.name)}
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-foreground" />
            </div>
          </button>

          {/* Upload Button */}
          <div className="flex-1">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-body transition-colors"
            >
              <Trans>Change Avatar</Trans>
            </button>
            <p className="text-xs text-muted-foreground mt-1">
              <Trans>Recommended: 400x400px</Trans>
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <label htmlFor="profile-name" className="text-sm font-medium text-foreground">
          <Trans>Name</Trans>
        </label>
        <Input
          id="profile-name"
          value={profile.name}
          onChange={handleNameChange}
          placeholder={t`Your name`}
          className="font-body"
        />
      </div>

      {/* Bio Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="profile-bio" className="text-sm font-medium text-foreground">
            <Trans>Bio</Trans>
          </label>
          <span
            className={cn(
              'text-xs tabular-nums transition-colors',
              charCount > 70
                ? 'text-warning'
                : charCount === 80
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            {charCount}/80
          </span>
        </div>
        <Textarea
          id="profile-bio"
          value={profile.bio}
          onChange={handleBioChange}
          placeholder={t`Tell your story in 80 characters...`}
          className="font-body resize-none min-h-[80px]"
          maxLength={80}
        />
      </div>

      {/* Theme Color Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          <Trans>Theme Color</Trans>
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          {themeColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => handleThemeChange(color.value)}
              className={cn(
                'relative w-10 h-10 rounded-full transition-colors duration-150',
                color.class,
                profile.themeColor === color.value
                  ? 'ring-4 ring-offset-2 ring-offset-background ring-primary scale-110'
                  : ''
              )}
              title={color.name}
            >
              {profile.themeColor === color.value && (
                <motion.div
                  layoutId="theme-selected"
                  className="absolute inset-0 rounded-full border-2 border-background"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          <Trans>This color is used as an accent in your link page</Trans>
        </p>
      </div>
    </motion.div>
  );
}

