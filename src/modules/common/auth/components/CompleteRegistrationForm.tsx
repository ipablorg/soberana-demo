import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ArrowLeft, User, Globe, CreditCard } from '@/shared/components/animated-icons';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCompleteRegistration } from '../api/use-complete-registration';
import { useToast } from '@/shared/components/ui/use-toast';
import { mapError } from '@/shared/lib/error-mapper';
import { LegalModal } from '@/shared/components/ui/legal-modal';
import { TERMS_AND_CONDITIONS_HTML, PRIVACY_POLICY_HTML } from '@/shared/constants/legal-content';
import {
  COUNTRY_DOC_CONFIG,
  ISO2_TO_ISO3,
  REGISTRATION_COUNTRY_SELECT_OPTIONS,
  REGISTRATION_PHONE_CODE_OPTIONS,
  REGISTRATION_UNSUPPORTED_COUNTRY_OPTIONS,
} from './register/constants';
import type { RegistrationRequiredResponse } from '@/shared/types/auth.types';

interface CompleteRegistrationFormProps {
  registrationData: RegistrationRequiredResponse;
  onBack?: () => void;
}

export function CompleteRegistrationForm({ registrationData, onBack }: CompleteRegistrationFormProps) {
  const navigate = useNavigate();
  const { t } = useLingui();
  const { toast } = useToast();

  const firebaseUser = registrationData.firebase_user;

  // Phone processing: separate code from number if possible, or just default Country Code
  const [formData, setFormData] = useState({
    name: firebaseUser.name || '',
    phoneCode: '+57',
    phone: firebaseUser.phone_number?.replace(/^\+57|^\+52|^\+593/, '') || '',
    country: '',
    identificationNumber: '',
    acceptTerms: false,
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const { completeRegistration, isLoading: isSubmitting } = useCompleteRegistration({
    onSuccess: () => {
      toast({
        title: t`Registration complete!`,
        description: t`Welcome to Loopay! You have successfully completed your profile.`,
      });
      navigate('/suite/dashboard', { replace: true });
    },
    onError: (error) => {
      const mapped = mapError(error);
      toast({
        variant: 'destructive',
        title: t`Could not complete registration`,
        description: mapped.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acceptTerms) {
      toast({ variant: 'destructive', title: t`Terms needed`, description: t`Accept the terms and conditions to continue.` });
      return;
    }

    completeRegistration({
      accessToken: registrationData.access_token,
      email: firebaseUser.email,
      name: formData.name,
      phone: `${formData.phoneCode}${formData.phone}`,
      country: ISO2_TO_ISO3[formData.country] ?? formData.country,
      identificationNumber: formData.identificationNumber,
      policy: formData.acceptTerms,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const docConfig = formData.country ? COUNTRY_DOC_CONFIG[formData.country] : null;

  return (
    <Card className="shadow-sm flex flex-col max-h-[calc(100dvh-10rem)] overflow-hidden">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onBack ?? (() => navigate('/login'))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">
              <Trans>Complete Registration</Trans>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              <Trans>Just a few more details to set up your Loopay account.</Trans>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4">
          
          <div className="space-y-4 rounded-md bg-muted/50 p-4 border border-border/50">
            <div>
              <Label className="text-xs text-muted-foreground"><Trans>Connected Email</Trans></Label>
              <div className="font-medium text-sm mt-1">{firebaseUser.email}</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comp-name">
              <Trans>Full Name</Trans>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="comp-name" 
                name="name" 
                type="text" 
                placeholder={t`John Doe`} 
                value={formData.name} 
                onChange={handleChange} 
                className="pl-10" 
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comp-phone">
              <Trans>Phone</Trans>
            </Label>
            <div className="flex">
              <Select value={formData.phoneCode} onValueChange={(value) => handleFieldChange('phoneCode', value)}>
                <SelectTrigger className="w-20 rounded-r-none border-r-0">
                  <SelectValue placeholder="+00" />
                </SelectTrigger>
                <SelectContent>
                  {REGISTRATION_PHONE_CODE_OPTIONS.map((option) => (
                    <SelectItem key={`${option.iso2}-${option.phoneCode}`} value={option.phoneCode}>
                      {option.flag ? `${option.flag} ` : ''}{option.phoneCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                id="comp-phone" 
                name="phone" 
                type="tel" 
                placeholder={t`3001234567`} 
                value={formData.phone} 
                onChange={handleChange} 
                className="rounded-l-none" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="comp-country">
                <Trans>Country</Trans>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                <Select value={formData.country} onValueChange={(value) => handleFieldChange('country', value)} required>
                  <SelectTrigger id="comp-country" className="pl-10">
                    <SelectValue placeholder={t`Select country`} />
                  </SelectTrigger>
                  <SelectContent>
                    {REGISTRATION_COUNTRY_SELECT_OPTIONS.map((option) => (
                      <SelectItem key={option.iso3} value={option.value} disabled={!option.supported}>
                        <span>
                          {option.flag ? `${option.flag} ` : ''}
                          {option.name}
                          {!option.supported ? ` — ${t`KYC only for now`}` : ''}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {REGISTRATION_UNSUPPORTED_COUNTRY_OPTIONS.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <Trans>
                    Some KYC countries are visible here but remain unavailable during registration until local phone and document metadata is configured.
                  </Trans>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comp-identificationNumber">{docConfig ? docConfig.label : <Trans>ID Number</Trans>}</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="comp-identificationNumber"
                  name="identificationNumber"
                  type="text"
                  placeholder={docConfig ? docConfig.placeholder : t`1234567890`}
                  value={formData.identificationNumber}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="comp-terms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => handleFieldChange('acceptTerms', checked as boolean)}
            />
            <Label
              htmlFor="comp-terms"
              className="text-xs leading-normal text-muted-foreground font-normal"
            >
              <Trans>I accept the</Trans>{' '}
              <button type="button" onClick={() => setShowTermsModal(true)} className="text-primary hover:underline transition-colors duration-150">
                <Trans>terms and conditions</Trans>
              </button>{' '}
              <Trans>and the</Trans>{' '}
              <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-primary hover:underline transition-colors duration-150">
                <Trans>privacy policy</Trans>
              </button>
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2 pb-5 shrink-0">
          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11"
            disabled={isSubmitting}
          >
            {isSubmitting ? t`Completing...` : t`Complete Registration`}
          </Button>
        </CardFooter>
      </form>
      <LegalModal open={showTermsModal} onOpenChange={setShowTermsModal} title={t`Terms and Conditions`} htmlContent={TERMS_AND_CONDITIONS_HTML} />
      <LegalModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} title={t`Privacy Policy`} htmlContent={PRIVACY_POLICY_HTML} />
    </Card>
  );
}
