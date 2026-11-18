import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from '@/shared/components/animated-icons';
import { Trans } from '@lingui/react/macro';

const mockTransactions = [
  {
    id: 'TXN-001',
    type: 'payout',
    amount: 1250.00,
    currency: 'USD',
    recipient: 'Proveedor ABC',
    status: 'completed',
    timestamp: '2 min ago',
  },
  {
    id: 'TXN-002',
    type: 'collect',
    amount: 3500.00,
    currency: 'COP',
    sender: 'Cliente XYZ',
    status: 'completed',
    timestamp: '15 min ago',
  },
  {
    id: 'TXN-003',
    type: 'transfer',
    amount: 500.00,
    currency: 'USD',
    details: 'USD → USDT',
    status: 'processing',
    timestamp: '1 hora ago',
  },
  {
    id: 'TXN-004',
    type: 'payout',
    amount: 750.00,
    currency: 'EUR',
    recipient: 'Proveedor DEF',
    status: 'completed',
    timestamp: '2 horas ago',
  },
  {
    id: 'TXN-005',
    type: 'collect',
    amount: 2100.00,
    currency: 'BRL',
    sender: 'Cliente ABC',
    status: 'failed',
    timestamp: '3 horas ago',
  },
];

export function RecentTransactions() {
  return (
    <Card className="rounded-xl border-sidebar-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold"><Trans>Recent Transactions</Trans></CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
          <div className="space-y-2">
            {mockTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer"
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  ${tx.type === 'payout' ? 'bg-destructive/10' : ''}
                  ${tx.type === 'collect' ? 'bg-success/10' : ''}
                  ${tx.type === 'transfer' ? 'bg-primary/10' : ''}
                `}>
                  {tx.type === 'payout' && <ArrowUpRight className="w-4 h-4 text-destructive" />}
                  {tx.type === 'collect' && <ArrowDownLeft className="w-4 h-4 text-success" />}
                  {tx.type === 'transfer' && <RefreshCw className="w-4 h-4 text-primary" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-medium truncate">
                      {tx.type === 'payout' && tx.recipient}
                      {tx.type === 'collect' && tx.sender}
                      {tx.type === 'transfer' && tx.details}
                    </p>
                    <Badge 
                      variant={tx.status === 'completed' ? 'default' : tx.status === 'processing' ? 'secondary' : 'destructive'}
                      className="text-[9px] h-4 px-1.5"
                    >
                      {tx.status === 'completed' && '✓'}
                      {tx.status === 'processing' && '⏳'}
                      {tx.status === 'failed' && '✕'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold font-mono tabular-nums">
                      ${tx.amount.toLocaleString()} {tx.currency}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{tx.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
