# Loopay Links - Bio Link Builder

A Linktree-style bio link builder integrated into the Loopay Suite.

## 📁 Directory Structure

```
loopay-links/
├── stores/
│   └── useLinksStore.ts      # Zustand store for profile & links state
├── components/
│   ├── PhoneMockup.tsx        # Mobile preview with phone frame
│   ├── EditorPanel.tsx        # Left panel editing interface
│   └── index.ts               # Component exports
├── pages/
│   ├── builder.tsx            # Main builder page (split-screen layout)
│   └── index.ts               # Page exports
├── index.ts                   # Public API exports
└── README.md                  # This file
```

## 🚀 Features

### State Management (Zustand)
- **Profile Data:** Name, bio, avatar, theme color, social links
- **Links Management:** Add, update, delete, reorder, toggle visibility
- **Mock Data:** Pre-populated with sample data for immediate preview
- **Real-Time Sync:** Changes update the phone mockup instantly

### Layout Architecture
- **Desktop:** Split-screen layout (Editor 60% | Preview 40%)
- **Mobile:** Editor-only view with floating preview button + drawer
- **Responsive:** Seamless breakpoint handling with Tailwind

### Profile Personalization (NEW 🎨)
- **Avatar Upload:** Circular display with initials placeholder
- **Name Input:** Real-time sync to preview
- **Bio Textarea:** Max 80 chars with color-coded counter
- **Theme Selector:** 6 preset colors with smooth animations
- **Initials Logic:** Shows user's initials when no avatar

### Link Editing ✨
- **Add Link Button:** Prominent gradient button to add new links
- **Link Cards:** Editable cards with title, URL, icon, and controls
- **Real-Time Preview:** Changes appear in phone mockup as you type
- **Auto-Save Indicator:** Debounced (1s) "Saving..." feedback
- **URL Validation:** Visual feedback for invalid URLs
- **Visibility Toggle:** Show/hide links with green Switch component
- **Delete Action:** Trash icon with red hover state
- **Drag & Drop:** Reorder links with smooth animations (NEW ⚡)

### Drag & Drop Reordering (NEW ⚡)
- **Grip Handle:** Six-dot icon appears on hover
- **Smooth Animations:** Hardware-accelerated CSS transforms
- **Instant Preview Update:** Phone mockup reflects new order immediately
- **Keyboard Support:** Accessible drag & drop for screen readers
- **8px Activation:** Prevents accidental drags

### Conversion CTA (NEW 💎)
- **Claim Link Button:** Prominent gradient CTA with glow effect
- **Custom URL Preview:** Shows `links.loopay.com/username`
- **Auth Modal:** Opens on click (only moment we ask for login)
- **Value Props:** Shows benefits of claiming (analytics, themes, etc.)
- **Animated Sparkles:** Attention-grabbing micro-animation

### Shadow Account Logic
- ✅ **No Login Required:** Users can create without authentication
- ✅ **Soft Onboarding:** Zero friction - just start building
- ✅ **Auto-Save:** All changes saved automatically after 1s debounce
- ✅ **Guest Mode:** Works immediately with temp session
- ✅ **Claim Transition:** Convert shadow account to real account on CTA click

### Design System Compliance
- ✅ **Semantic Tokens Only:** No hardcoded hex colors
- ✅ **Typography:** `font-heading` (Lexend) for titles, `font-body` (Poppins) for content
- ✅ **Loopay Branding:** Gradient borders (`gradient-border-hover`, `gradient-border-thin-always`), brand gradient text
- ✅ **Framer Motion:** Smooth animations with `AnimatePresence` for all transitions
- ✅ **Status Colors:** Green for success/visible, red for destructive actions

## 🎨 Components

### PhoneMockup
A CSS-only mobile frame that displays the live preview:
- iPhone-style frame with notch and home indicator
- Scrollable content area with gradient background
- Profile section (avatar, name, bio, social links)
- Links list with hover effects and gradient borders
- "Powered by Loopay" footer
- **Real-time updates** from `useLinksStore`

### EditorPanel
The work area for building your links:
- **Header** with auto-save indicator (Saving/Saved)
- **Shadow Account Badge** ("No login required")
- **Add Link Button** with gradient styling
- **Link Cards List** with `AnimatePresence` animations
- **Empty State** when no links exist
- **Stats Footer** showing total/visible link counts
- Fully responsive with mobile-first approach

### LinkCard
Interactive card for editing individual links:
- **Auto-focus** on title input for new links
- **Title Input** with real-time store updates
- **URL Input** with validation and error messages
- **Icon/Emoji Selector** (click to change)
- **Visibility Toggle** (Radix UI Switch, green when active)
- **Delete Button** (trash icon, red hover)
- **Drag Handle** (shown on hover, for future DnD)
- **Gradient Border** when newly created (`gradient-border-thin-always`)

### AddLinkButton
Primary action button to add new links:
- Brand gradient background (`bg-brand-gradient`)
- Animated plus icon (rotates on hover)
- Adds new link to top of list with auto-focus
- Triggers save indicator

### SaveIndicator
Shows autosave status:
- **Saving State:** Cloud icon with pulse animation
- **Saved State:** Check icon with spring animation
- **Debounced:** 1s delay to avoid flickering
- Color-coded (muted for saving, green for saved)

### LinksBuilder (Page)
Main page that orchestrates the layout:
- Split-screen on desktop (fixed preview panel)
- Floating preview button on mobile
- Sheet/drawer for mobile preview

## 📍 Routes

Access the builder at: **`/links/builder`**

```tsx
// Defined in: src/app/routes/links-routes.tsx
<Route path="/links/builder" element={<LinksBuilder />} />
```

## 🧪 Usage

### Basic Usage
```tsx
import { LinksBuilder } from '@/modules/loopay-links';

function App() {
  return <LinksBuilder />;
}
```

### Advanced - Direct Store Access
```tsx
import { useLinksStore } from '@/modules/loopay-links';

function CustomComponent() {
  const { profile, links, updateProfile, addLink, updateLink } = useLinksStore();
  
  // Update profile name
  updateProfile({ name: 'New Name' });
  
  // Add a new link programmatically
  addLink({
    title: 'My Portfolio',
    url: 'https://example.com',
    isVisible: true,
    icon: '🌟',
  });
  
  // Update a specific link
  updateLink('link-id-123', { title: 'Updated Title' });
  
  return (
    <div>
      <h1>{profile.name}</h1>
      <p>Total Links: {links.length}</p>
    </div>
  );
}
```

### Testing Real-Time Sync
1. Open `/links/builder`
2. Click "Add New Link"
3. Type in the title field
4. **Watch the phone mockup update instantly!**
5. Toggle visibility - see the link appear/disappear in preview
6. Notice "Saving..." indicator after 1 second of inactivity

## 🔮 Future Enhancements

- [ ] **Profile Editor:** Dedicated form to edit name, bio, avatar, social links
- [ ] **Drag-and-Drop:** Reorder links with beautiful animations
- [ ] **Icon Picker:** Modal to select from emoji/icon library
- [ ] **Thumbnail Upload:** Upload custom thumbnails for links
- [ ] **Theme Customizer:** Choose colors, fonts, button styles
- [ ] **Public View:** `/:username` route for public-facing pages
- [ ] **Analytics Dashboard:** Track link clicks, visitor stats, top performers
- [ ] **Custom Themes:** Extended theme options beyond default
- [ ] **SEO Optimization:** Meta tags and social preview cards
- [ ] **Export/Share:** Generate shareable links and QR codes
- [ ] **Shadow Account Persistence:** Save to localStorage or backend API
- [ ] **Account Claiming:** Convert guest session to full account

## 🎯 Design Principles

1. **Flow over Form:** Minimize friction, pre-fill data when available
2. **Liquid UI:** Smooth transitions with Framer Motion
3. **White-Label Architecture:** Uses semantic tokens for easy theming
4. **Visual Trust:** Perfect alignment, tabular numbers, consistent spacing
5. **Mobile-First:** Responsive by default, touch-friendly on mobile

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Zustand** for state management
- **Framer Motion** for animations
- **Tailwind CSS** with semantic design tokens
- **Shadcn UI** components (Button, Sheet)
- **Lucide React** for icons

---

**Built with ❤️ by the Loopay Team**

