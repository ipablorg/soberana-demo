import { create } from 'zustand';
import type { ProfileData, LinkItem, LinksState, Currency } from '../types';

// Re-export types for backward compatibility
export type { ProfileData, LinkItem, LinksState };

// Initial profile data (empty state - user will customize)
const mockProfile: ProfileData = {
  name: 'loopayuser',
  bio: 'Crypto payments made simple. Building the future of autonomous finance.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  themeColor: 'primary',
  socialLinks: {
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
  },
};

// Start with empty links - user creates their own
const mockLinks: LinkItem[] = [];

export const useLinksStore = create<LinksState>((set) => ({
  profile: mockProfile,
  links: mockLinks,

  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),

  addLink: (newLink) =>
    set((state) => ({
      links: [
        {
          ...newLink,
          id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
        ...state.links, // Add to beginning for newest-first
      ],
    })),

  updateLink: (id, updates) =>
    set((state) => ({
      links: state.links.map((link) =>
        link.id === id ? { ...link, ...updates } : link
      ),
    })),

  deleteLink: (id) =>
    set((state) => ({
      links: state.links.filter((link) => link.id !== id),
    })),

  reorderLinks: (startIndex, endIndex) =>
    set((state) => {
      const newLinks = [...state.links];
      const [removed] = newLinks.splice(startIndex, 1);
      newLinks.splice(endIndex, 0, removed);
      return { links: newLinks };
    }),

  toggleLinkActive: (id) =>
    set((state) => ({
      links: state.links.map((link) =>
        link.id === id ? { ...link, active: !link.active } : link
      ),
    })),
}));

