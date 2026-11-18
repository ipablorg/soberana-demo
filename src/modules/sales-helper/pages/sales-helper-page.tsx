import { Outlet } from 'react-router-dom';
import { SalesHelperLayout } from '../layouts/SalesHelperLayout';

export default function SalesHelperPage() {
  return (
    <SalesHelperLayout>
      <Outlet />
    </SalesHelperLayout>
  );
}
