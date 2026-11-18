import { useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { type DockSection } from '@/shared/components/common/BottomDock';
import { TransactionsView } from '@/modules/suite-user/features/transactions/components/TransactionsView';
import { BeneficiariesView } from '@/modules/suite-user/features/beneficiaries/components/BeneficiariesView';
import { SoberanaCardView } from '@/modules/suite-user/features/soberana-card/components/soberana-card-view';
import { SettingsView } from '@/modules/suite-user/features/settings/components/SettingsView';
import { BrandCurvesBackdrop } from '@/shared/components/brand/brand-curves-backdrop';
import { useWorkflowComposerStore } from '@/shared/stores/use-workflow-composer-store';
import { isInternalProductSettingsEnabled } from '@/shared/lib/dev-config';

const ConversationalHome = lazy(
  () => import('@/modules/suite-user/features/dashboard/pages/conversational-home'),
);

const WorkflowFlowsSection = lazy(
  () => import('@/modules/workflow-composer/pages/workflow-flows'),
);

/**
 * SuiteShell — embeddable content switcher for the dashboard route.
 *
 * Receives `activeSection` from the parent (`AppLayout`) and renders
 * the corresponding view. The `BottomDock` is no longer rendered here
 * — it lives in the layout so it's always visible across all routes.
 *
 * The floating dock overlays the content on every viewport, so the
 * bottom padding reserves its height plus the device safe-area inset.
 */

const ShellFallback = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

interface SuiteShellProps {
  activeSection: DockSection;
}

export function SuiteShell({ activeSection }: SuiteShellProps) {
  const workflowEnabled =
    useWorkflowComposerStore((s) => s.enabled) && isInternalProductSettingsEnabled();

  useEffect(() => {
    if (!workflowEnabled && activeSection === 'flows') {
      // Handled by the parent resetting to 'home' via dock onChange
    }
  }, [workflowEnabled, activeSection]);

  return (
    <>
      <BrandCurvesBackdrop />
      <div className="relative pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {activeSection === 'home' && (
              <Suspense fallback={<ShellFallback />}>
                <ConversationalHome />
              </Suspense>
            )}
            {activeSection === 'transactions' && <TransactionsView />}
            {activeSection === 'beneficiaries' && <BeneficiariesView />}
            {activeSection === 'card' && <SoberanaCardView />}
            {activeSection === 'flows' && workflowEnabled && (
              <Suspense fallback={<ShellFallback />}>
                <WorkflowFlowsSection />
              </Suspense>
            )}
            {activeSection === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
