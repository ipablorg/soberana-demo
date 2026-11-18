/**
 * UserTypeSelector Component
 * 
 * Displays user type badges (Pro, Payouts, OTC, Plus) with animations.
 * Controls which products and modes are visible in the UI.
 */

import { motion } from 'framer-motion';
import { useUserTypeStore, UserType } from '@/shared/stores/useUserTypeStore';
import { USER_TYPE_CONFIG } from '@/shared/config/user-types.config';

const USER_TYPES: UserType[] = ['pro', 'payouts', 'otc', 'plus'];

export function UserTypeSelector() {
  const { userType, setUserType } = useUserTypeStore();

  return (
    <div className="flex items-center gap-1.5 mx-3">
      {USER_TYPES.map((type) => {
        const isActive = userType === type;
        const config = USER_TYPE_CONFIG[type];

        return (
          <button
            key={type}
            onClick={() => setUserType(type)}
            className={`
              relative px-3 py-1.5 rounded-full text-xs font-semibold 
              transition-colors duration-150 overflow-hidden
              ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }
            `}
          >
            {/* Animated gradient background for active badge */}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-primary"
                animate={{
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            
            {/* Label */}
            <span className="relative z-10">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}

