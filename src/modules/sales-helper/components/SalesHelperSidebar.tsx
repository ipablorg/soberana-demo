import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  ShieldCheck,
  DollarSign,
  Globe2,
  BarChart3,
  ArrowLeftRight,
  Bitcoin,
  Users,
  FileText,
  Flag,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from '@/shared/components/animated-icons';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

export interface SalesNavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  description: string;
}

export const SALES_NAV_ITEMS: SalesNavItem[] = [
  { label: 'Nuevo Cliente', path: '/ventas/intake', icon: UserPlus, description: 'Wizard de intake' },
  { label: 'Catálogo 2026', path: '/ventas/catalogo', icon: Package, description: 'Productos y ANS' },
  { label: 'Pricing', path: '/ventas/pricing', icon: DollarSign, description: 'Tabla maestra de tarifas' },
  { label: 'Consolidado', path: '/ventas/consolidado', icon: Globe2, description: 'Capacidad por país' },
  { label: 'Por Volumen', path: '/ventas/volumen', icon: BarChart3, description: 'Pricing por movilizado' },
  { label: 'Calc. COMEX', path: '/ventas/calculadora-comex', icon: ArrowLeftRight, description: 'Calculadora COMEX' },
  { label: 'Calc. On/Off Ramp', path: '/ventas/calculadora-ramp', icon: Bitcoin, description: 'Calculadora crypto' },
  { label: 'Calc. Referidos', path: '/ventas/calculadora-referidos', icon: Users, description: 'Comisiones referidos' },
  { label: 'Caso Ejemplo', path: '/ventas/caso', icon: FileText, description: 'Simulación de caso' },
  { label: 'Liquidador Chile', path: '/ventas/liquidador-chile', icon: Flag, description: 'Costos USDT/CHL' },
];

export function SalesHelperSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className={cn(
        'hidden h-screen flex-col border-r border-border bg-card md:flex',
        'transition-colors duration-150'
      )}
      animate={{ width: collapsed ? 64 : 260 }}
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-4">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="font-heading text-base font-semibold text-foreground">
              Sales Helper
            </span>
            <span className="text-xs text-muted-foreground">
              Herramienta Comercial
            </span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-1">
          {SALES_NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150',
                    isActive
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col"
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {item.description}
                    </span>
                  </motion.div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border px-3 py-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              Datos internos — No compartir
            </span>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
