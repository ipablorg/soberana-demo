/**
 * `/backoffice/commercial/clients` — commercial entry point. A client is picked
 * by name from the client options list; if that list cannot be loaded for the
 * role, the page falls back to opening a client by id.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Link, useNavigate } from 'react-router-dom';

import { Plus } from '@/shared/components/animated-icons';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { OptionSelect } from '../../../components/option-select';
import { ProviderRequirementsBanner } from '../../provider-requirements/components/provider-requirements-banner';
import { useClientOptions } from '../../ops-review/hooks/use-client-options';
import { isClientIdValid } from '../lib/commercial-logic';

export default function CommercialClients() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { options, isLoading, error } = useClientOptions();
  const [clientId, setClientId] = useState('');
  const valid = isClientIdValid(clientId);
  const canPickByName = !error && (isLoading || options.length > 0);

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <PageHeader
        title={t`Comercial`}
        subtitle={t`Onboarding de clientes en proveedores y gestión de sus tarifas`}
        actions={
          <Button asChild>
            <Link to="/backoffice/commercial/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              <Trans>Nuevo cliente</Trans>
            </Link>
          </Button>
        }
      />

      {/* Comercial lands here: pending provider requirements must be noticed (S21). */}
      <ProviderRequirementsBanner />

      <div className="space-y-2">
        <Label htmlFor="commercial-client-id">
          {canPickByName ? <Trans>Abrir un cliente</Trans> : <Trans>Abrir un cliente por ID</Trans>}
        </Label>
        <div className="flex gap-2">
          {canPickByName ? (
            <OptionSelect
              id="commercial-client-id"
              value={clientId}
              onChange={setClientId}
              disabled={isLoading}
              options={options.map((option) => ({
                value: option.client_id,
                label: option.is_active ? option.client_name : t`${option.client_name} (inactivo)`,
              }))}
              placeholder={t`Selecciona un cliente`}
              className="flex-1"
            />
          ) : (
            <Input
              id="commercial-client-id"
              className="font-mono"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
            />
          )}
          <Button
            disabled={!valid}
            onClick={() => navigate(`/backoffice/commercial/clients/${clientId.trim()}`)}
          >
            <Trans>Abrir</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
}
