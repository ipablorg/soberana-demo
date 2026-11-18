import { useCallback } from 'react';
import { useBrandingStore } from '@/shared/stores/useBrandingStore';

export type { BrandingConfig } from '@/shared/stores/useBrandingStore';
export { brandingConfigSchema } from '@/shared/stores/useBrandingStore';

export function useBrandingTheme() {
  const config = useBrandingStore((s) => s.config);
  const updateBranding = useBrandingStore((s) => s.updateBranding);
  const resetBranding = useBrandingStore((s) => s.resetBranding);

  const saveBranding = useCallback(() => {
    return { success: true, error: null };
  }, []);

  const hslToHex = useCallback((hsl: string): string => {
    const [h, s, l] = hsl.split(/\s+/).map((v) => {
      const num = parseFloat(v.replace('%', ''));
      return v.includes('%') ? num / 100 : num;
    });

    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }, []);

  const hexToHsl = useCallback((hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%';

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }, []);

  return {
    config,
    isLoading: false,
    updateBranding,
    saveBranding,
    resetBranding,
    hslToHex,
    hexToHsl,
  };
}
