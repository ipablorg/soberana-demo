/**
 * API Changelog Page
 * 
 * Timeline of API updates, new features, and breaking changes
 */

import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { 
  Calendar,
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle2
} from '@/shared/components/animated-icons';

export default function ChangelogPage() {
  const changelogEntries = [
    {
      date: '2024-12-16',
      version: 'v1.3.0',
      type: 'feature',
      changes: [
        {
          title: 'Partner Fees API',
          description: 'New endpoints for managing partner fee configurations. Create, read, and list partner fees programmatically.',
          type: 'added',
          endpoints: ['/v1/partner-fees'],
        },
        {
          title: 'Idempotency Support',
          description: 'All POST endpoints now support idempotency keys to prevent duplicate operations.',
          type: 'improved',
        },
      ],
    },
    {
      date: '2024-11-28',
      version: 'v1.2.0',
      type: 'feature',
      changes: [
        {
          title: 'Transfer Transactions',
          description: 'New endpoint for crypto-to-crypto transfers between wallets on Polygon, Ethereum, and BSC networks.',
          type: 'added',
          endpoints: ['/v1/transactions/transfer'],
        },
        {
          title: 'Enhanced Verification',
          description: 'Added document-level status tracking in customer verification responses.',
          type: 'improved',
        },
      ],
    },
    {
      date: '2024-11-10',
      version: 'v1.1.0',
      type: 'feature',
      changes: [
        {
          title: 'Bank Accounts API',
          description: 'New endpoints for creating and managing customer bank accounts for fiat operations.',
          type: 'added',
          endpoints: ['/v1/bank-accounts'],
        },
        {
          title: 'Exchange Rates',
          description: 'Real-time exchange rate quotes with 5-minute validity windows.',
          type: 'added',
          endpoints: ['/v1/exchange-rates'],
        },
      ],
    },
    {
      date: '2024-10-15',
      version: 'v1.0.1',
      type: 'fix',
      changes: [
        {
          title: 'Pagination Cursor Fix',
          description: 'Fixed cursor-based pagination returning incorrect results on last page.',
          type: 'fixed',
        },
        {
          title: 'Webhook Retry Logic',
          description: 'Improved webhook retry exponential backoff algorithm.',
          type: 'improved',
        },
      ],
    },
    {
      date: '2024-10-01',
      version: 'v1.0.0',
      type: 'major',
      changes: [
        {
          title: 'Initial Release',
          description: 'First stable release of Global Connectors API with support for customers, transactions, and webhooks.',
          type: 'added',
        },
        {
          title: 'On-Ramp & Off-Ramp',
          description: 'Fiat-to-crypto and crypto-to-fiat conversion endpoints.',
          type: 'added',
          endpoints: ['/v1/transactions/on-ramp', '/v1/transactions/off-ramp'],
        },
        {
          title: 'Customer Management',
          description: 'Full CRUD operations for customer accounts with KYC verification.',
          type: 'added',
          endpoints: ['/v1/customers'],
        },
      ],
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4" />;
      case 'improved':
        return <Wrench className="h-4 w-4" />;
      case 'fixed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'breaking':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      added: 'bg-success/10 text-success border-success/20',
      improved: 'bg-primary/10 text-primary border-primary/20',
      fixed: 'bg-warning/10 text-warning border-warning/20',
      breaking: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    return (
      <Badge variant="outline" className={`text-xs ${styles[type] || ''}`}>
        {type}
      </Badge>
    );
  };

  const getVersionBadge = (type: string) => {
    const styles: Record<string, string> = {
      major: 'bg-primary text-primary-foreground',
      feature: 'bg-success/10 text-success border-success/20',
      fix: 'bg-warning/10 text-warning border-warning/20',
    };

    return (
      <Badge className={styles[type] || ''}>
        {type === 'major' && '🎉 '}
        {type === 'feature' && '✨ '}
        {type === 'fix' && '🐛 '}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex">
      {/* Center Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0 px-6 py-6 lg:px-10 max-w-4xl"
      >
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Calendar className="h-3 w-3 mr-1" />
              Changelog
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading">
              API Changelog
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl">
              Stay up to date with the latest changes, improvements, and new features in the 
              Global Connectors API.
            </p>
          </div>

          <Separator />

          {/* Changelog Timeline */}
          <div className="relative space-y-8">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />

            {changelogEntries.map((entry, entryIndex) => (
              <motion.div
                key={entryIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: entryIndex * 0.1 }}
                className="relative pl-12"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border-2 border-primary">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>

                <Card className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-foreground">
                        {entry.version}
                      </h2>
                      {getVersionBadge(entry.type)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <Separator />

                  {/* Changes */}
                  <div className="space-y-4">
                    {entry.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getTypeIcon(change.type)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground">
                                {change.title}
                              </h3>
                              {getTypeBadge(change.type)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {change.description}
                            </p>
                            {change.endpoints && change.endpoints.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {change.endpoints.map((endpoint, i) => (
                                  <code 
                                    key={i}
                                    className="text-xs font-mono bg-muted px-2 py-1 rounded border border-border"
                                  >
                                    {endpoint}
                                  </code>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Separator />

          {/* Subscribe Section */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Stay Updated
                </h3>
                <p className="text-sm text-muted-foreground">
                  Subscribe to our developer newsletter to receive notifications about API updates, 
                  new features, and important changes. Breaking changes are announced at least 30 days 
                  in advance.
                </p>
              </div>
            </div>
          </Card>

          {/* Version Policy */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Versioning Policy
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                We follow semantic versioning (MAJOR.MINOR.PATCH):
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">MAJOR:</strong> Breaking changes that require code updates
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">MINOR:</strong> New features that are backward compatible
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">PATCH:</strong> Bug fixes and minor improvements
                  </span>
                </li>
              </ul>
              <p className="pt-2">
                All API endpoints support version pinning via the <code className="bg-muted px-1 py-0.5 rounded font-mono">X-API-Version</code> header.
              </p>
            </div>
          </Card>
        </div>
      </motion.main>

      {/* Right column - empty for consistency */}
      <div className="hidden xl:block w-[480px] shrink-0" />
    </div>
  );
}
