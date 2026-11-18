import { Button, ButtonProps } from '@/shared/components/ui/button';
import { MagneticHover } from '@/shared/lib/ui/magnetic-hover';
import { forwardRef } from 'react';

interface MagneticCTAProps extends ButtonProps {
  strength?: number;
}

export const MagneticCTA = forwardRef<HTMLButtonElement, MagneticCTAProps>(
  ({ children, strength = 0.3, className, ...props }, ref) => {
    return (
      <MagneticHover strength={strength} className="inline-block">
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      </MagneticHover>
    );
  }
);

MagneticCTA.displayName = 'MagneticCTA';
