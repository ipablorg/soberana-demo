import { Check, Clock, X } from '@/shared/components/animated-icons';
import type { StepValidation, StepProgress } from '../../lib/kyc-progress';
import { getStepValidationStatus } from '../../lib/kyc-progress';

interface RequirementsChecklistProps {
  validations: StepValidation[];
  stepName: string;
  customerType: 'individual' | 'business';
}

export function RequirementsChecklist({ validations, stepName, customerType }: RequirementsChecklistProps) {
  if (validations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No requirements for this step
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {validations.map((validation, index) => (
        <ValidationItem 
          key={`${stepName}-${validation.field}-${index}`} 
          validation={validation} 
        />
      ))}
    </div>
  );
}

function ValidationItem({ validation }: { validation: StepValidation }) {
  const getStatusIcon = () => {
    switch (validation.status) {
      case 'passed':
        return <Check className="h-4 w-4 text-success" />;
      case 'failed':
        return <X className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (validation.status) {
      case 'passed':
        return 'text-success';
      case 'failed':
        return 'text-destructive';
      case 'pending':
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="mt-0.5 flex-shrink-0">
        {getStatusIcon()}
      </div>
      <div className="flex-1 space-y-0.5">
        <p className={getStatusColor()}>
          {formatFieldLabel(validation.field)}
        </p>
        {validation.message && (
          <p className="text-xs text-muted-foreground">
            {validation.message}
          </p>
        )}
      </div>
    </div>
  );
}

function formatFieldLabel(field: string): string {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}