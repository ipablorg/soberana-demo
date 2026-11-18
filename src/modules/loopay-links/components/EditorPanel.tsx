import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLinksStore } from '../stores/useLinksStore';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { CreatePaymentLinkFlow } from './CreatePaymentLinkFlow';
import { ClaimLinkButton } from './ClaimLinkButton';

/**
 * EditorPanel - Left side of the Builder (Initial Version - No Account)
 * 
 * Features:
 * - Conversational flow for creating payment links (primary)
 * - Shadow account logic (no login required)
 * - Links are stored locally and previewed in real-time
 * 
 * NOTE: "My Links" management will be available after claiming account
 */
export function EditorPanel() {
  const [saveTimestamp, setSaveTimestamp] = useState(Date.now());
  const [showClaimButton, setShowClaimButton] = useState(false);
  
  // Debounce the save timestamp to show "Saving..." indicator
  const debouncedSaveTimestamp = useDebounce(saveTimestamp, 1000);
  const [isSaving, setIsSaving] = useState(false);

  // Manage saving state based on debounce
  useEffect(() => {
    if (saveTimestamp !== debouncedSaveTimestamp) {
      setIsSaving(true);
    } else {
      setIsSaving(false);
    }
  }, [saveTimestamp, debouncedSaveTimestamp]);

  const handleSaveTriggered = () => {
    setSaveTimestamp(Date.now());
  };

  const handleFlowComplete = () => {
    handleSaveTriggered();
    setShowClaimButton(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Main Content - Payment Link Creation Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CreatePaymentLinkFlow
            onComplete={handleFlowComplete}
            onCancel={undefined}
            showClaimButton={showClaimButton}
          />
        </motion.div>
      </div>
    </div>
  );
}

