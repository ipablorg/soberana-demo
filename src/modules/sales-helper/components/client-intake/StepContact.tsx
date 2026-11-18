import { useState } from 'react';
import { User, Building2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useClientIntakeStore } from '../../stores/client-intake-store';

interface StepContactProps {
  onNext: () => void;
}

export function StepContact({ onNext }: StepContactProps) {
  const { contactName, companyName, setContact } = useClientIntakeStore();
  const [name, setName] = useState(contactName);
  const [company, setCompany] = useState(companyName);

  const canContinue = name.trim().length > 0 && company.trim().length > 0;

  const handleSubmit = () => {
    if (!canContinue) return;
    setContact(name.trim(), company.trim());
    onNext();
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-8">
      <div className="flex w-full flex-col gap-4 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Nombre del contacto
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            Empresa
          </label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
      </div>

      <Button
        variant="gradient"
        onClick={handleSubmit}
        disabled={!canContinue}
      >
        Continuar
      </Button>
    </div>
  );
}
