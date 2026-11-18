import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { CardContent, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Lock, Eye, EyeOff } from '@/shared/components/animated-icons';
import { LegalModal } from '@/shared/components/ui/legal-modal';
import { TERMS_AND_CONDITIONS_HTML, PRIVACY_POLICY_HTML } from '@/shared/constants/legal-content';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import type { RegisterFormData, PasswordValidation } from './constants';

interface SecurityStepProps {
  formData: RegisterFormData;
  passwordValidation: PasswordValidation;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldChange: (field: keyof RegisterFormData, value: string | boolean) => void;
  onSwitchToLogin?: () => void;
  isSubmitting: boolean;
  isPasswordValid: boolean;
}

export function SecurityStep({
  formData,
  passwordValidation,
  onChange,
  onFieldChange,
  onSwitchToLogin,
  isSubmitting,
  isPasswordValid,
}: SecurityStepProps) {
  const { t } = useLingui();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const passwordsMatch = formData.password === formData.confirmPassword;

  return (
    <>
      <CardContent className="space-y-3 flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-1.5">
          <Label htmlFor="reg-password">
            <Trans>Password</Trans>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t`••••••••`}
              value={formData.password}
              onChange={onChange}
              className="pl-10 pr-10"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrengthMeter validation={passwordValidation} visible={formData.password.length > 0} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-confirmPassword">
            <Trans>Confirm Password</Trans>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="reg-confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t`••••••••`}
              value={formData.confirmPassword}
              onChange={onChange}
              className="pl-10 pr-10"
              required
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150">
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-out ${
              formData.confirmPassword && !passwordsMatch
                ? 'grid-rows-[1fr]'
                : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-xs text-destructive pt-1">
                <Trans>Passwords do not match</Trans>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-1">
          <Checkbox
            id="reg-acceptTerms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => onFieldChange('acceptTerms', checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="reg-acceptTerms" className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            <Trans>I accept the</Trans>{' '}
            <button type="button" onClick={() => setShowTermsModal(true)} className="text-primary hover:underline transition-colors duration-150">
              <Trans>terms and conditions</Trans>
            </button>{' '}
            <Trans>and the</Trans>{' '}
            <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-primary hover:underline transition-colors duration-150">
              <Trans>privacy policy</Trans>
            </button>
          </label>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2 pb-5 shrink-0">
        <Button
          variant="gradient"
          type="submit"
          className="w-full"
          disabled={isSubmitting || !isPasswordValid || !passwordsMatch || !formData.acceptTerms}
        >
          {isSubmitting ? t`Creating account...` : t`Create Account`}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <Trans>Already have an account?</Trans>{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium hover:underline transition-colors duration-150">
            <Trans>Sign in</Trans>
          </button>
        </div>
      </CardFooter>

      <LegalModal open={showTermsModal} onOpenChange={setShowTermsModal} title={t`Terms and Conditions`} htmlContent={TERMS_AND_CONDITIONS_HTML} />
      <LegalModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} title={t`Privacy Policy`} htmlContent={PRIVACY_POLICY_HTML} />
    </>
  );
}
