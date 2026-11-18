/**
 * AmazonasDashboardContext — Summary y datos de transacciones para la sidebar derecha.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { TxRow } from '@/modules/amazonas/types/txdata.types';

interface TxSummarySidebar {
  totalOutboundFormatted: string;
  dateMin: string;
  dateMax: string;
}

interface AmazonasDashboardContextValue {
  txSummary: TxSummarySidebar | null;
  setTxSummary: (s: TxSummarySidebar | null) => void;
  txRows: TxRow[];
  setTxRows: (rows: TxRow[]) => void;
}

const AmazonasDashboardContext = createContext<AmazonasDashboardContextValue | null>(null);

export function AmazonasDashboardProvider({ children }: { children: ReactNode }) {
  const [txSummary, setTxSummary] = useState<TxSummarySidebar | null>(null);
  const [txRows, setTxRows] = useState<TxRow[]>([]);

  return (
    <AmazonasDashboardContext.Provider
      value={{
        txSummary,
        setTxSummary,
        txRows,
        setTxRows,
      }}
    >
      {children}
    </AmazonasDashboardContext.Provider>
  );
}

export function useAmazonasDashboard() {
  const ctx = useContext(AmazonasDashboardContext);
  if (!ctx) return null;
  return ctx;
}
