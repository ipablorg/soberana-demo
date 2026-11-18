import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from '@/shared/components/animated-icons';
import { PhoneMockup } from '../components/PhoneMockup';
import { EditorPanel } from '../components/EditorPanel';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { Trans } from '@lingui/react/macro';

/**
 * LinksBuilder - Main page for Loopay Payment Links
 * 
 * Layout:
 * - Left Panel: Editor with tabs (Create | Manage | Profile)
 * - Right Panel: Live preview (desktop only)
 * - Mobile: Floating preview button
 */
export function LinksBuilder() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex flex-col lg:flex-row">
      {/* LEFT PANEL: Editor with Tabs */}
      <div className="flex-1 lg:w-3/5 overflow-hidden">
        <EditorPanel />
      </div>

      {/* RIGHT PANEL: Live Preview (Desktop Only) */}
      <div className="hidden lg:block lg:w-2/5 border-l border-border bg-muted/30">
        <div className="sticky top-0 h-screen">
          {/* Preview Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-linear-to-b from-muted/30 to-transparent">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Eye className="w-4 h-4" />
              <span className="font-body"><Trans>Live Preview</Trans></span>
            </div>
          </div>

          {/* Phone Mockup */}
          <PhoneMockup />
        </div>
      </div>

      {/* MOBILE: Floating Preview Button + Drawer */}
      <div className="lg:hidden">
        <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <SheetTrigger asChild>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <Button
                size="lg"
                variant="gradient"
                className="h-14 w-14 p-0"
              >
                <Eye className="w-5 h-5" />
              </Button>
            </motion.div>
          </SheetTrigger>

          <SheetContent side="bottom" className="h-[90vh] p-0">
            <SheetHeader className="p-6 border-b border-border">
              <SheetTitle className="flex items-center justify-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <span><Trans>Live Preview</Trans></span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="h-[calc(90vh-80px)] overflow-hidden">
              <PhoneMockup />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

