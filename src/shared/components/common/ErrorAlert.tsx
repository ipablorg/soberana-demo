/**
 * ErrorAlert Component
 * 
 * Reusable component for displaying user-friendly error messages.
 * Supports different error categories with appropriate styling and icons.
 */

import { useEffect, useState } from 'react';
import { AlertCircle, WifiOff, ShieldAlert, AlertTriangle, X, RefreshCw } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { mapError, type ErrorCategory } from '@/shared/lib/error-mapper';

interface ErrorAlertProps {
  /** Error object to display */
  error: any;
  
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
  
  /** Auto-dismiss after N milliseconds (0 = never) */
  autoDismiss?: number;
  
  /** Show retry button */
  showRetry?: boolean;
  
  /** Custom className */
  className?: string;
  
  /** Show technical details (disabled by default for better UX) */
  showTechnical?: boolean;
}

/**
 * Get icon based on error category
 */
function getErrorIcon(category: ErrorCategory) {
  switch (category) {
    case 'AUTH':
      return ShieldAlert;
    case 'NETWORK':
      return WifiOff;
    case 'VALIDATION':
      return AlertTriangle;
    case 'PERMISSION':
      return ShieldAlert;
    case 'SERVER':
    case 'UNKNOWN':
    default:
      return AlertCircle;
  }
}

/**
 * Get alert variant based on error category
 */
function getAlertVariant(category: ErrorCategory): 'default' | 'destructive' {
  switch (category) {
    case 'AUTH':
    case 'PERMISSION':
    case 'SERVER':
      return 'destructive';
    case 'VALIDATION':
    case 'NETWORK':
    case 'UNKNOWN':
    default:
      return 'default';
  }
}

/**
 * Get title based on error category
 */
function getErrorTitle(category: ErrorCategory): string {
  switch (category) {
    case 'AUTH':
      return 'Error de Autenticación';
    case 'NETWORK':
      return 'Error de Conexión';
    case 'VALIDATION':
      return 'Datos Inválidos';
    case 'PERMISSION':
      return 'Acceso Denegado';
    case 'SERVER':
      return 'Error del Servidor';
    case 'UNKNOWN':
    default:
      return 'Error';
  }
}

/**
 * ErrorAlert Component
 * 
 * @example
 * ```tsx
 * <ErrorAlert
 *   error={error}
 *   onRetry={() => refetch()}
 *   onDismiss={() => setError(null)}
 *   showRetry
 *   autoDismiss={5000}
 * />
 * ```
 */
export function ErrorAlert({
  error,
  onRetry,
  onDismiss,
  autoDismiss = 0,
  showRetry = false,
  className,
  showTechnical = false, // Disabled by default - only friendly messages
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Map error to user-friendly format
  const mappedError = mapError(error);
  const Icon = getErrorIcon(mappedError.category);
  const variant = getAlertVariant(mappedError.category);
  const title = getErrorTitle(mappedError.category);

  // Auto-dismiss logic
  useEffect(() => {
    if (autoDismiss > 0 && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300); // Wait for exit animation
  };

  const handleRetry = () => {
    onRetry?.();
  };

  if (!error || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Alert variant={variant} className="relative">
          {/* Dismiss Button */}
          {onDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute right-3 top-3 rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Icon + Content */}
          <div className="flex items-start gap-3 pr-8">
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            
            <div className="flex-1 space-y-2">
              <AlertTitle className="text-base font-semibold mb-1">
                {title}
              </AlertTitle>
              
              <AlertDescription className="text-sm leading-relaxed">
                {mappedError.message}
              </AlertDescription>

              {/* Technical Details (Development Only) */}
              {showTechnical && mappedError.technical && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    {showDetails ? 'Ocultar detalles técnicos' : 'Ver detalles técnicos'}
                  </button>
                  
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                          <p className="text-xs font-mono text-muted-foreground break-all">
                            {mappedError.technical}
                          </p>
                          {mappedError.code && (
                            <p className="text-xs font-mono text-muted-foreground mt-1">
                              Code: {mappedError.code}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Action Buttons */}
              {(showRetry && mappedError.retryable) && (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    type="button"
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className={cn(
                      'gap-2',
                      variant === 'destructive' && 'border-destructive/50 hover:bg-destructive/10'
                    )}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reintentar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Simple error message display (without Alert wrapper)
 */
export function ErrorMessage({ error, className }: { error: any; className?: string }) {
  const mappedError = mapError(error);
  
  return (
    <div className={cn('text-sm text-destructive', className)}>
      {mappedError.message}
    </div>
  );
}
