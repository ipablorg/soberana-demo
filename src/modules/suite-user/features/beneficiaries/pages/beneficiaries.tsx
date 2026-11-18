import { PageTransition } from '@/shared/components/motion/PageTransition';
import { BeneficiariesView } from '../components/BeneficiariesView';

/**
 * BeneficiariesPage — thin wrapper that adapts `BeneficiariesView`
 * for the legacy `/suite/beneficiaries` route. Adds the page-level
 * `PageTransition` chrome that the SuiteShell-embedded view doesn't
 * need (the shell owns its own AnimatePresence).
 */
export default function BeneficiariesPage() {
  return (
    <PageTransition>
      <BeneficiariesView />
    </PageTransition>
  );
}
