import { Card, CardContent } from '@/shared/components/ui/card';
import type { StepProgress, StepName } from '../../lib/kyc-progress';
import { getStepLabel, getStepDescription, getStepValidationStatus, isStepFullyValidated } from '../../lib/kyc-progress';
import { Check, Clock, AlertTriangle } from '@/shared/components/animated-icons';
import { RequirementsChecklist } from './requirements-checklist';

interface StepProgressCardProps {
  stepName: StepName;
  stepProgress: StepProgress;
  customerType: 'individual' | 'business';
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

export function StepProgressCard({ 
  stepName, 
  stepProgress, 
  customerType, 
  isActive = false,
  isCompleted = false,
  onClick 
}: StepProgressCardProps) {
  const validationStatus = getStepValidationStatus(stepProgress);
  const isFullyValidated = isStepFullyValidated(stepProgress);
  
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          <Check className="h-3.5 w-3.5" />
          Completed
        </div>
      );
    }
    
    switch (validationStatus) {
      case 'complete':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <Check className="h-3.5 w-3.5" />
            Ready
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            In Progress
          </div>
        );
      case 'empty':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </div>
        );
    }
  };

  const progressPercentage = stepProgress.validations.length > 0
    ? Math.round((stepProgress.validations.filter(v => v.status === 'passed').length / stepProgress.validations.length) * 100)
    : 0;

  return (
    <Card 
      className={`transition-all hover:border-primary/50 ${
        isActive ? 'border-primary ring-1 ring-primary/20' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-sm">
                {getStepLabel(stepName, customerType)}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getStepDescription(stepName, customerType)}
              </p>
            </div>
            
            {stepProgress.validations.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {getStatusBadge()}
        </div>
        
        {isActive && stepProgress.validations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/60">
            <RequirementsChecklist 
              validations={stepProgress.validations}
              stepName={stepName}
              customerType={customerType}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}