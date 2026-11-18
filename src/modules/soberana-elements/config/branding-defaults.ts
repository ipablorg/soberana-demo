import type { WidgetTheme } from '../types';

export const DEFAULT_THEME: WidgetTheme = {
  primaryColor: '#ffffff',
  backgroundColor: '#09090b',
  textColor: '#fafafa',
  borderRadius: 'lg',
  fontFamily: 'geist',
  companyName: 'Mi Empresa',
  darkMode: true,
};

export const BORDER_RADIUS_MAP: Record<WidgetTheme['borderRadius'], string> = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  full: '9999px',
};

export const FONT_FAMILY_MAP: Record<WidgetTheme['fontFamily'], string> = {
  system: 'system-ui, sans-serif',
  inter: 'Inter, sans-serif',
  geist: '"Geist Sans", sans-serif',
};
