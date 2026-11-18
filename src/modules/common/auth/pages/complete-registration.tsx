import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { AuthLayout } from '@/shared/layouts';
import { CompleteRegistrationForm } from '../components/CompleteRegistrationForm';
import type { RegistrationRequiredResponse } from '@/shared/types/auth.types';

export default function CompleteRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLingui();

  const registrationData = location.state as RegistrationRequiredResponse;

  // If no registration data is present in state, redirect to login
  if (!registrationData || !registrationData.requires_registration) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthLayout
      headline={t`Send money across borders.`}
      rotatingWords={[t`In minutes.`, t`Not days.`, t`Worldwide.`]}
      subtitle={t`Cross-border payments for businesses and people. From dollars to euros to pesos to reais — through the fastest rail available.`}
    >
      <CompleteRegistrationForm
        registrationData={registrationData}
        onBack={() => navigate('/login')}
      />
    </AuthLayout>
  );
}
