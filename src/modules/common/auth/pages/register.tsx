import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { AuthLayout } from '@/shared/layouts';
import { RegisterForm } from '../components/RegisterForm';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLingui();

  return (
    <AuthLayout
      headline={t`Send money across borders.`}
      rotatingWords={[t`In minutes.`, t`Not days.`, t`Worldwide.`]}
      subtitle={t`Cross-border payments for businesses and people. From dollars to euros to pesos to reais — through the fastest rail available.`}
    >
      <RegisterForm
        onSwitchToLogin={() => navigate('/login')}
        onBack={() => navigate('/')}
      />
    </AuthLayout>
  );
}
