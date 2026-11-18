import { motion } from 'framer-motion';
import { Plus } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useLinksStore } from '../stores/useLinksStore';

interface AddLinkButtonProps {
  onAdd?: () => void;
}

/**
 * AddLinkButton - Primary action button to add new links
 * 
 * Features:
 * - Prominent gradient styling
 * - Smooth hover animations
 * - Adds new link to top of list
 * - Triggers save indicator
 */
export function AddLinkButton({ onAdd }: AddLinkButtonProps) {
  const { addLink } = useLinksStore();

  const handleAddLink = () => {
    // Add new payment link (all links are now payment buttons)
    addLink({
      title: '',
      amount: 0,
      currency: 'USD',
      active: true,
      icon: '💰',
      description: '',
    });
    
    onAdd?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={handleAddLink}
        size="lg"
        variant="gradient"
        className="w-full font-heading text-base h-14 group"
      >
        <motion.div
          className="flex items-center justify-center gap-2"
        >
          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-5 h-5" />
          </motion.div>
          <span>Add Payment Button</span>
        </motion.div>
      </Button>
    </motion.div>
  );
}

