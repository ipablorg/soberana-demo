import { Trans, useLingui } from '@lingui/react/macro';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { CardContent, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight, User, Mail } from '@/shared/components/animated-icons';
import type { RegisterFormData } from './constants';

interface PersonalInfoStepProps {
    formData: RegisterFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFieldChange: (field: keyof RegisterFormData, value: string | boolean) => void;
    onNext: () => void;
    onSwitchToLogin?: () => void;
    isValid: boolean;
}

export function PersonalInfoStep({
    formData,
    onChange,
    onNext,
    onSwitchToLogin,
    isValid,
}: PersonalInfoStepProps) {
    const { t } = useLingui();

    return (
        <>
            <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="reg-firstName">
                                <Trans>First Name</Trans>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="reg-firstName" name="firstName" type="text" placeholder={t`John`} value={formData.firstName} onChange={onChange} className="pl-10" required />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="reg-lastName">
                                <Trans>Last Name</Trans>
                            </Label>
                            <Input id="reg-lastName" name="lastName" type="text" placeholder={t`Doe`} value={formData.lastName} onChange={onChange} required />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="reg-email">
                            <Trans>Email</Trans>
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="reg-email" name="email" type="email" placeholder={t`you@company.com`} value={formData.email} onChange={onChange} className="pl-10" required />
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                        <p className="text-sm font-medium text-foreground">
                            <Trans>We’ll ask for compliance details later.</Trans>
                        </p>
                        <p className="mt-1 hidden text-xs leading-relaxed text-muted-foreground sm:block">
                            <Trans>
                                For now, we only need your account basics so you can create your login and continue onboarding. You will choose whether the account is for you or for a business during identity verification.
                            </Trans>
                        </p>
                    </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2 pb-5 shrink-0">
                <Button
                    type="button"
                    variant="gradient"
                    className="w-full gap-2"
                    onClick={onNext}
                    disabled={!isValid}
                >
                    <Trans>Continue</Trans>
                    <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    <Trans>Already have an account?</Trans>{' '}
                    <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium hover:underline transition-colors duration-150">
                        <Trans>Sign in</Trans>
                    </button>
                </div>
            </CardFooter>
        </>
    );
}
