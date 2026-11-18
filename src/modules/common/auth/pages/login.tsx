import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { AuthLayout } from '@/shared/layouts';
import { LoginForm } from '../components/login-form';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLingui();

  return (
    <AuthLayout
      headline={t`Send money across borders.`}
      rotatingWords={[t`In minutes.`, t`Not days.`, t`Worldwide.`]}
      subtitle={t`Cross-border payments for businesses and people. From dollars to euros to pesos to reais — through the fastest rail available.`}
    >
      <LoginForm
        onSwitchToRegister={() => navigate('/register')}
        onBack={() => navigate('/')}
      />
    </AuthLayout>
  );
}
