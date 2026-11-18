import { Outlet } from 'react-router-dom';

export function WorkflowLayout() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Outlet />
    </div>
  );
}
