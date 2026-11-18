/**
 * AmazonasSidebarInfo — Right sidebar contextual info per section.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, MessageCircle } from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { buildCsvForExport } from '@/modules/amazonas/data/txdata';
import { useAmazonasDashboard } from '@/modules/amazonas/context/AmazonasDashboardContext';

export interface AmazonasSidebarInfoProps {
  section: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const DOC_LINKS = [
  { title: 'Manifiesto', href: '/amazonas/manifiesto' },
  { title: 'Zentinel', href: '/amazonas/sovy' },
  { title: 'Vaults', href: '/amazonas/vaults' },
  { title: 'Amazonas + Soberana', href: '/amazonas/amazonas-soberana' },
];

export function AmazonasSidebarInfo({ section }: AmazonasSidebarInfoProps) {
  const ctx = useAmazonasDashboard();
  const summary = ctx?.txSummary ?? null;
  const txRows = ctx?.txRows ?? [];

  const handleDownload = () => {
    if (txRows.length === 0) return;
    const csv = buildCsvForExport(txRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `loopay-tx-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Docs links — shown in Q&A, Flujos, Estados y en las propias páginas de documentación */}
      {(section === 'qa' || section === 'flujos' || section === 'manifiesto' || section === 'sovy' || section === 'vaults' || section === 'amazonas-soberana') && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Documentación
          </p>
          <div className="space-y-2">
            {DOC_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <FileText className="h-4 w-4 shrink-0" />
                {link.title}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Transacciones: KPIs rápidos + Descargar */}
          {section === 'transacciones' && (
            <>
              {summary && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Resumen rápido
                  </p>
                  <Card className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Volumen total: <span className="font-semibold text-foreground font-mono tabular-nums">{summary.totalOutboundFormatted}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Período: <span className="text-foreground font-mono tabular-nums">08/25 → 02/26</span>
                    </p>
                  </Card>
                </motion.div>
              )}
              <button
                type="button"
                onClick={handleDownload}
                disabled={txRows.length === 0}
                className="flex items-center gap-2 w-full rounded-lg border border-border bg-card/80 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors duration-150 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Descargar informes
              </button>
            </>
          )}

      {/* CTA Agendar cita — all sections */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Link
          to="/amazonas/amazonas-soberana#contact"
          className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/20 transition-colors duration-150"
        >
          <MessageCircle className="h-4 w-4" />
          Agendar cita
        </Link>
      </motion.div>
    </div>
  );
}
