import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import type { VaultFee, VaultFeeExample } from '../../content/vaults-content';

export interface FeeExampleProps {
  fees: VaultFee[];
  example: VaultFeeExample;
  alignment: string;
}

export function FeeExampleCard({ fees, example, alignment }: FeeExampleProps) {
  return (
    <div className="space-y-8">
      {/* Fee table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-sm font-semibold text-foreground">Fee</th>
                <th className="px-5 py-3 text-right text-sm font-semibold text-foreground tabular-nums">Rate</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-foreground hidden sm:table-cell">Applied to</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, i) => (
                <tr key={fee.name} className={i < fees.length - 1 ? 'border-b border-border/50' : ''}>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{fee.name}</td>
                  <td className="px-5 py-3 text-sm text-right tabular-nums text-foreground">{fee.rate}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell">{fee.appliedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Numerical example */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="p-6 md:p-8">
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Investment</span>
              <span className="text-foreground font-semibold tabular-nums">{example.investment}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Duration</span>
              <span className="text-foreground tabular-nums">{example.duration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gross return ({example.grossReturn})</span>
              <span className="text-foreground tabular-nums">{example.grossAmount}</span>
            </div>

            <div className="border-t border-border/50 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Management fee <span className="text-xs opacity-60">({example.managementCalc})</span></span>
                <span className="text-destructive tabular-nums">−{example.managementFee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Performance fee <span className="text-xs opacity-60">({example.performanceCalc})</span></span>
                <span className="text-destructive tabular-nums">−{example.performanceFee}</span>
              </div>
            </div>

            <div className="border-t-2 border-primary/30 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-foreground font-bold">Net return</span>
                <span className="text-success font-bold tabular-nums text-lg">{example.netReturn}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground text-xs">Net yield</span>
                <span className="text-success tabular-nums">{example.netYield}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-6 leading-relaxed font-sans">
            {alignment}
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
