import { useCallback } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import type { WidgetTheme, BorderRadiusPreset, FontPreset } from '../../types';

interface BrandingEditorProps {
  theme: WidgetTheme;
  onChange: (theme: Partial<WidgetTheme>) => void;
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm text-muted-foreground shrink-0">{label}</Label>
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer">
          <div
            className="h-7 w-7 rounded-full border border-border shadow-sm"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7"
          />
        </label>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-8 w-28 font-mono text-xs"
          maxLength={7}
        />
      </div>
    </div>
  );
}

const RADIUS_OPTIONS: { value: BorderRadiusPreset; label: string }[] = [
  { value: 'sm', label: 'Suave' },
  { value: 'md', label: 'Medio' },
  { value: 'lg', label: 'Grande' },
  { value: 'full', label: 'Circular' },
];

export function BrandingEditor({ theme, onChange }: BrandingEditorProps) {
  const handleColor = useCallback(
    (key: 'primaryColor' | 'backgroundColor' | 'textColor') =>
      (value: string) => onChange({ [key]: value }),
    [onChange],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Company info */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Trans>Empresa</Trans>
        </p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="company-name" className="text-sm"><Trans>Nombre de la empresa</Trans></Label>
          <Input
            id="company-name"
            value={theme.companyName}
            onChange={e => onChange({ companyName: e.target.value })}
            placeholder={t`ej. FreelancePro`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="logo-url" className="text-sm"><Trans>URL del logo</Trans></Label>
          <div className="flex items-center gap-2">
            {theme.logoUrl && (
              <img
                src={theme.logoUrl}
                alt={t`Logo`}
                className="h-8 w-8 rounded-md object-contain border border-border bg-muted"
              />
            )}
            <Input
              id="logo-url"
              value={theme.logoUrl ?? ''}
              onChange={e => onChange({ logoUrl: e.target.value })}
              placeholder="https://mi-empresa.com/logo.png"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Trans>Colores</Trans>
        </p>
        <ColorField
          label={t`Color primario`}
          value={theme.primaryColor}
          onChange={handleColor('primaryColor')}
        />
        <ColorField
          label={t`Fondo`}
          value={theme.backgroundColor}
          onChange={handleColor('backgroundColor')}
        />
        <ColorField
          label={t`Texto`}
          value={theme.textColor}
          onChange={handleColor('textColor')}
        />
      </div>

      <Separator />

      {/* Radius */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Trans>Bordes redondeados</Trans>
        </p>
        <Tabs
          value={theme.borderRadius}
          onValueChange={v => onChange({ borderRadius: v as BorderRadiusPreset })}
        >
          <TabsList className="w-full">
            {RADIUS_OPTIONS.map(r => (
              <TabsTrigger key={r.value} value={r.value} className="flex-1 text-xs">
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Separator />

      {/* Font */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground"><Trans>Tipografía</Trans></p>
        </div>
        <Select
          value={theme.fontFamily}
          onValueChange={v => onChange({ fontFamily: v as FontPreset })}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="geist">Geist</SelectItem>
            <SelectItem value="inter">Inter</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Dark mode */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground"><Trans>Modo oscuro</Trans></p>
          <p className="text-xs text-muted-foreground"><Trans>Tema por defecto del widget</Trans></p>
        </div>
        <Switch
          checked={theme.darkMode}
          onCheckedChange={v => onChange({ darkMode: v })}
        />
      </div>
    </div>
  );
}
