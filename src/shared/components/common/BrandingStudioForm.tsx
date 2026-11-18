import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HexColorPicker } from 'react-colorful';
import { Upload, X, RotateCcw, Palette } from '@/shared/components/animated-icons';
import { useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { useBrandingTheme } from '@/shared/hooks/use-branding-theme';
import { toast } from 'sonner';
import { useLingui } from '@lingui/react/macro';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { useMemo } from 'react';

type FormValues = {
  appName: string;
  logo?: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
};

interface BrandingStudioFormProps {
  onSave?: () => void;
}

/**
 * BrandingStudioForm
 * 
 * Form component for configuring white-label branding settings.
 * Includes logo upload, app name, and color customization with live preview.
 */
export function BrandingStudioForm({ onSave }: BrandingStudioFormProps) {
  const { config, updateBranding, saveBranding, resetBranding, hslToHex, hexToHsl } = useBrandingTheme();
  const [logoPreview, setLogoPreview] = useState<string | undefined>(config.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLingui();

  // Create validation schema with translated messages
  const formSchema = useMemo(() => z.object({
    appName: z
      .string()
      .min(2, t`App name must be at least 2 characters`)
      .max(50, t`App name must not exceed 50 characters`)
      .regex(/^[a-zA-Z0-9\s]+$/, t`Only letters, numbers, and spaces allowed`),
    logo: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, t`Invalid color format`),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, t`Invalid color format`),
    surfaceColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, t`Invalid color format`),
  }), [t]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appName: config.appName,
      logo: config.logo,
      primaryColor: hslToHex(config.colors.primary),
      accentColor: hslToHex(config.colors.accent),
      surfaceColor: hslToHex(config.colors.surface),
    },
  });

  /**
   * Handle logo file selection and conversion to base64
   */
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t`Image too large`, {
        description: t`Choose an image smaller than 2MB`,
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t`Invalid file type`, {
        description: t`Choose an image file (PNG, JPG, SVG)`,
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      form.setValue('logo', base64);
      
      // Update live preview immediately
      updateBranding({ logo: base64 });
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle logo removal
   */
  const handleLogoRemove = () => {
    setLogoPreview(undefined);
    form.setValue('logo', undefined);
    updateBranding({ logo: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle color changes with live preview
   */
  const handleColorChange = (field: 'primaryColor' | 'accentColor' | 'surfaceColor', hexColor: string) => {
    form.setValue(field, hexColor);
    
    // Convert to HSL and update live preview
    const hslColor = hexToHsl(hexColor);
    const colorKey = field.replace('Color', '') as 'primary' | 'accent' | 'surface';
    
    updateBranding({
      colors: {
        ...config.colors,
        [colorKey]: hslColor,
      },
    });
  };

  /**
   * Handle form submission
   */
  const onSubmit = (values: FormValues) => {
    // Final update before saving
    updateBranding({
      appName: values.appName,
      logo: values.logo,
      colors: {
        primary: hexToHsl(values.primaryColor),
        accent: hexToHsl(values.accentColor),
        surface: hexToHsl(values.surfaceColor),
      },
    });

    // Save to localStorage
    const result = saveBranding();
    
    if (result.success) {
      toast.success(t`Brand settings saved`, {
        description: t`Your customization is live`,
      });
      onSave?.();
    } else {
      toast.error(t`Couldn't save settings`, {
        description: result.error || t`Try again in a moment`,
      });
    }
  };

  /**
   * Handle reset to defaults
   */
  const handleReset = () => {
    resetBranding();
    form.reset({
      appName: 'Loopay',
      logo: undefined,
      primaryColor: hslToHex('210 80% 50%'),
      accentColor: hslToHex('190 70% 45%'),
      surfaceColor: hslToHex('220 28% 10%'),
    });
    setLogoPreview(undefined);
    
    toast.info(t`Back to defaults`, {
      description: t`Branding restored to Loopay defaults`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section: Corporate Identity */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t`Corporate Identity`}
            </h3>
            <TypewriterText
              text={t`Upload your logo and define your app name`}
              speed={30}
              delay={100}
              className="text-xs text-muted-foreground mt-1"
            />
          </div>

          {/* Logo Upload */}
          <FormField
            control={form.control}
            name="logo"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-muted-foreground">
                  {t`Company Logo`}
                </FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {/* Dropzone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="max-h-24 max-w-[200px] object-contain"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLogoRemove();
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {t`Click to upload logo`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t`PNG, JPG, SVG (max 2MB)`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* App Name */}
          <FormField
            control={form.control}
            name="appName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-muted-foreground">
                  {t`App Name`}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t`Enter your app name`}
                    className="bg-background"
                    onChange={(e) => {
                      field.onChange(e);
                      updateBranding({ appName: e.target.value });
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  <TypewriterText
                    text={t`This name will be displayed in the wallet interface`}
                    speed={30}
                    delay={100}
                  />
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section: Color Palette */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t`Color Palette`}
            </h3>
            <TypewriterText
              text={t`Define your brand colors for the theming engine`}
              speed={30}
              delay={100}
              className="text-xs text-muted-foreground mt-1"
            />
          </div>

          {/* Primary Color */}
          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-muted-foreground">
                  {t`Primary Brand Color`}
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="h-10 w-10 rounded-lg border border-border shadow-sm transition-transform"
                          style={{ backgroundColor: field.value }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <HexColorPicker
                          color={field.value}
                          onChange={(color) => handleColorChange('primaryColor', color)}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      value={field.value}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="flex-1 font-mono text-sm bg-background"
                      placeholder="#3B82F6"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  <TypewriterText text={t`Main action buttons and highlights`} speed={30} delay={100} />
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Accent Color */}
          <FormField
            control={form.control}
            name="accentColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-muted-foreground">
                  {t`Accent Color`}
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="h-10 w-10 rounded-lg border border-border shadow-sm transition-transform"
                          style={{ backgroundColor: field.value }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <HexColorPicker
                          color={field.value}
                          onChange={(color) => handleColorChange('accentColor', color)}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      value={field.value}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="flex-1 font-mono text-sm bg-background"
                      placeholder="#14B8A6"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  <TypewriterText text={t`Secondary highlights and decorative elements`} speed={30} delay={100} />
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Surface Color */}
          <FormField
            control={form.control}
            name="surfaceColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-muted-foreground">
                  {t`Surface/Card Color`}
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="h-10 w-10 rounded-lg border border-border shadow-sm transition-transform"
                          style={{ backgroundColor: field.value }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <HexColorPicker
                          color={field.value}
                          onChange={(color) => handleColorChange('surfaceColor', color)}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      value={field.value}
                      onChange={(e) => handleColorChange('surfaceColor', e.target.value)}
                      className="flex-1 font-mono text-sm bg-background"
                      placeholder="#1E293B"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  <TypewriterText text={t`Background color for cards and panels`} speed={30} delay={100} />
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            className="w-full"
          >
            {t`Save Changes`}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t`Reset to Default`}
          </Button>
        </div>
      </form>
    </Form>
  );
}

