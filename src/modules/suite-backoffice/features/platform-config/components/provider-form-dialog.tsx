/**
 * Create/edit dialog for the providers catalog. #411: when editing, the type
 * and the active flag are shown but locked (the catalogue is read-only).
 *
 * The form state stays owned by `ProvidersTab` (it is what the create/update
 * mutation hooks read from and reset on success) — this component is purely
 * presentational so the state has a single source of truth.
 */

import type { FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { AdminProviderType } from '@/graphql/types/admin-loopay';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';

import {
  PROVIDER_TYPES,
  type ProviderFormErrors,
  type ProviderFormState,
} from '../lib/catalog-forms';

export interface ProviderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ProviderFormState;
  errors: ProviderFormErrors;
  showErrors: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  onFieldChange: <K extends keyof ProviderFormState>(field: K, value: ProviderFormState[K]) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}

export function ProviderFormDialog({
  open,
  onOpenChange,
  form,
  errors,
  showErrors,
  isEditing,
  isSubmitting,
  onFieldChange,
  onSubmit,
  onCancel,
}: ProviderFormDialogProps) {
  const { t } = useLingui();

  // Radix calls onOpenChange(false) for Esc / overlay click / the X button —
  // refuse those while a mutation is in flight, same as add-wallet-dialog.
  const handleOpenChange = (next: boolean) => {
    if (!next && isSubmitting) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="space-y-4" aria-label={t`Formulario de proveedor`}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? (
                <Trans>Editar proveedor {form.code}</Trans>
              ) : (
                <Trans>Nuevo proveedor</Trans>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider-code">
                <Trans>Código</Trans>
              </Label>
              <Input
                id="provider-code"
                value={form.code}
                disabled={isEditing}
                onChange={(event) => onFieldChange('code', event.target.value)}
                placeholder="openfort"
              />
              {showErrors && errors.code ? (
                <p className="text-xs text-destructive">
                  <Trans>El código es obligatorio.</Trans>
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider-name">
                <Trans>Nombre</Trans>
              </Label>
              <Input
                id="provider-name"
                value={form.name}
                onChange={(event) => onFieldChange('name', event.target.value)}
              />
              {showErrors && errors.name ? (
                <p className="text-xs text-destructive">
                  <Trans>El nombre es obligatorio.</Trans>
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider-type">
                <Trans>Tipo</Trans>
              </Label>
              <Select
                value={form.type}
                disabled={isEditing}
                onValueChange={(value) => onFieldChange('type', value as AdminProviderType)}
              >
                <SelectTrigger id="provider-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-8">
              <Switch
                id="provider-active"
                checked={form.isActive}
                disabled={isEditing}
                onCheckedChange={(checked) => onFieldChange('isActive', checked)}
              />
              <Label htmlFor="provider-active">
                <Trans>Activo</Trans>
              </Label>
            </div>
          </div>

          {isEditing ? (
            <p className="text-xs text-muted-foreground">
              <Trans>
                El tipo y el estado del proveedor no se cambian desde aquí: solo el nombre y la
                configuración.
              </Trans>
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="provider-config">
              <Trans>Configuración (JSON)</Trans>
            </Label>
            <Textarea
              id="provider-config"
              value={form.configText}
              onChange={(event) => onFieldChange('configText', event.target.value)}
              rows={8}
              className="font-mono text-sm"
              placeholder={'{\n  "wallet": { "defaultChain": "TRON", "currency": "USDT" }\n}'}
            />
            {showErrors && errors.config ? (
              <p className="text-xs text-destructive" role="alert">
                <Trans>La configuración debe ser un objeto JSON válido.</Trans>
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
              <Trans>Cancelar</Trans>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? <Trans>Guardar cambios</Trans> : <Trans>Crear proveedor</Trans>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
