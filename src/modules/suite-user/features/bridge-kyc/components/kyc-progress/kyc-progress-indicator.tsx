import { Card, CardContent } from '@/shared/components/ui/card';
import type { KycProgress } from '../../lib/kyc-progress';
import { CheckCircle2, Circle } from '@/shared/components/animated-icons';

interface KycProgressIndicatorProps {
  progress: KycProgress;
  currentStep: number;
  totalSteps: number;
}

export function KycProgressIndicator({ progress, currentStep, totalSteps }: KycProgressIndicatorProps) {
  const stepNames = Object.keys(progress.steps) as Array<keyof typeof progress.steps>;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Verification Progress</h3>
          <span className="text-sm font-medium text-primary">
            {progress.overallProgress}%
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress.overallProgress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% complete</span>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {stepNames.map((stepName, index) => {
            const step = progress.steps[stepName];
            if (!step) return null;
            
            const isCurrentStep = index === currentStep;
            const isCompleted = step.completed;
            const isPastStep = index < currentStep;
            
            return (
              <div 
                key={stepName}
                className={`flex items-center gap-2 text-sm ${
                  isCurrentStep ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                ) : isCurrentStep ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="capitalize">
                  {stepName.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}