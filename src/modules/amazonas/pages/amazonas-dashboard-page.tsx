/**
 * Amazonas Dashboard — Due Diligence para Banco Amazonas.
 * Wrapper: Provider + Layout. Nested routes render via Outlet in Layout.
 */

import { Outlet } from 'react-router-dom';
import { AmazonasDashboardProvider } from '@/modules/amazonas/context/AmazonasDashboardContext';
import { AmazonasDashboardLayout } from '@/modules/amazonas/layouts/AmazonasDashboardLayout';
import { AmazonasAccessGate } from '@/modules/amazonas/components/AmazonasAccessGate';

export default function AmazonasDashboardPage() {
  return (
    <AmazonasAccessGate>
      <AmazonasDashboardProvider>
        <AmazonasDashboardLayout>
          <Outlet />
        </AmazonasDashboardLayout>
      </AmazonasDashboardProvider>
    </AmazonasAccessGate>
  );
}
