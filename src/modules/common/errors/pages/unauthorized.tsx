import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ShieldCheck, ArrowLeft, Home } from '@/shared/components/animated-icons';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { Trans, useLingui } from '@lingui/react/macro';
import { useAuth } from '@/shared/hooks/use-auth';
import { getHomeRoute } from '@/shared/lib/tenant-roles';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { t } = useLingui();
  const { user } = useAuth();
  const descRef = useRef<HTMLDivElement>(null);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Staff → backoffice, tenant admins → tenant backoffice, everyone else → dashboard.
  const handleGoHome = () => {
    navigate(getHomeRoute(user));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <div className="rounded-xl bg-muted p-5">
            <ShieldCheck className="h-12 w-12 text-muted-foreground" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
          className="space-y-4"
        >
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
            <Trans>Restricted access</Trans>
          </h1>
          <div ref={descRef} className="min-h-8">
            <TypewriterText
              text={t`You don't have permissions to access this section. If you need access, contact your administrator.`}
              speed={25}
              delay={300}
              className="font-body font-light text-lg text-muted-foreground"
            />
          </div>
        </motion.div>

        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-xl border border-border bg-muted/30 p-4 text-sm"
          >
            <p className="text-muted-foreground">
              <Trans>Signed in as</Trans>{' '}
              <span className="font-medium text-foreground">{user.email}</span>
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-center gap-3"
        >
          <Button variant="outline" size="lg" onClick={handleGoBack}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            <Trans>Go back</Trans>
          </Button>
          <Button variant="default" size="lg" onClick={handleGoHome}>
            <Home className="mr-1.5 h-4 w-4" />
            <Trans>Dashboard</Trans>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
