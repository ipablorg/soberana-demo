import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useBridgeKYC } from '@/modules/suite-user/features/account';
import { Loader2 } from '@/shared/components/animated-icons';

export default function BridgeKYCPage() {
  const navigate = useNavigate();
  const { isKYCApproved, isLoading: isKYCLoading } = useBridgeKYC();

  useEffect(() => {
    navigate('/suite/verify-identity', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!isKYCLoading && isKYCApproved) {
      navigate('/suite/dashboard', { replace: true });
    }
  }, [isKYCApproved, isKYCLoading, navigate]);

  if (true) {
    return null;
  }

  if (isKYCLoading) {
    return <LoadingState />;
  }

  if (isKYCApproved) {
    return null;
  }

  return null;
}

function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

