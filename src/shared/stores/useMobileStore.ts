/**
 * Mobile Store
 *
 * Mobile-specific UI state: header visibility, active sheet, active
 * drawer, and scroll position. This store is independent and only
 * consumed by the mobile shell (`MobileLayout` + drawers + sheets).
 *
 * The `bottomNav*` state and the scroll-driven auto-hide logic were
 * removed together with `MobileBottomNav` — the conversational
 * dashboard replaces the nav, so the hide-on-scroll dance is no
 * longer meaningful. `scrollY` is kept as an inert accessor for any
 * future surface that needs scroll-aware chrome.
 */

import { create } from 'zustand';

type SheetType = 'move' | 'quickAction' | 'user' | 'more' | 'transfer' | 'convert' | null;

interface MobileStore {
  headerVisible: boolean;
  activeSheet: SheetType;
  activeDrawer: 'more' | 'user' | 'notifications' | null;

  scrollY: number;

  showHeader: () => void;
  hideHeader: () => void;

  openSheet: (sheetType: SheetType) => void;
  closeSheet: () => void;

  openDrawer: (drawerType: 'more' | 'user' | 'notifications') => void;
  closeDrawer: () => void;

  updateScrollY: (y: number) => void;

  reset: () => void;
}

export const useMobileStore = create<MobileStore>((set, get) => ({
  headerVisible: true,
  activeSheet: null,
  activeDrawer: null,
  scrollY: 0,

  showHeader: () => set({ headerVisible: true }),
  hideHeader: () => set({ headerVisible: false }),

  openSheet: (sheetType) => {
    get().closeDrawer();
    set({ activeSheet: sheetType });
  },
  closeSheet: () => set({ activeSheet: null }),

  openDrawer: (drawerType) => {
    get().closeSheet();
    set({ activeDrawer: drawerType });
  },
  closeDrawer: () => set({ activeDrawer: null }),

  updateScrollY: (y) => set({ scrollY: y }),

  reset: () => set({
    headerVisible: true,
    activeSheet: null,
    activeDrawer: null,
    scrollY: 0,
  }),
}));
