import { Trans } from '@lingui/react/macro';
import type { PasswordValidation } from './constants';

interface PasswordStrengthMeterProps {
  validation: PasswordValidation;
  visible: boolean;
}

export function PasswordStrengthMeter({ validation, visible }: PasswordStrengthMeterProps) {
  const metCount = Object.values(validation).filter(Boolean).length;

  return (
    <div
      className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out ${
        visible ? 'grid-rows-[1fr]' : ''
      }`}
    >
      <div className="overflow-hidden">
        <div className="pt-1.5 space-y-1">
          <div className="flex gap-1">
            {Object.values(validation).map((met, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
                  met ? (metCount >= 4 ? 'bg-success' : 'bg-warning') : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {metCount === 0 && <Trans>8+ chars, upper, lower, number, special</Trans>}
            {metCount > 0 && metCount < 5 && (
              <span>
                {metCount}/5 — {!validation.minLength && <Trans>8+ chars</Trans>}
                {!validation.hasUpperCase && <>{!validation.minLength && ', '}<Trans>uppercase</Trans></>}
                {!validation.hasLowerCase && <>{(!validation.minLength || !validation.hasUpperCase) && ', '}<Trans>lowercase</Trans></>}
                {!validation.hasNumber && <>{(metCount < 4) && ', '}<Trans>number</Trans></>}
                {!validation.hasSpecialChar && <>{(metCount < 4) && ', '}<Trans>special char</Trans></>}
              </span>
            )}
            {metCount === 5 && <span className="text-success"><Trans>Strong password</Trans></span>}
          </p>
        </div>
      </div>
    </div>
  );
}
