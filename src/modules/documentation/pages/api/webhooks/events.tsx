/**
 * API Webhook Events Page
 * 
 * List of all available webhook events
 */

import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { CodeBlock } from '@/modules/documentation/components/CodeBlock';
import { Separator } from '@/shared/components/ui/separator';

export default function WebhookEventsPage() {
  const events = [
    {
      category: "Transactions",
      items: [
        {
          name: "transaction.created",
          description: "Triggered when a new transaction is created",
          badge: "common",
          example: {
            id: "evt_abc123",
            type: "transaction.created",
            data: {
              id: "txn_abc123",
              type: "payout",
              status: "pending",
              amount: "1000.00",
              currency: "USD"
            }
          }
        },
        {
          name: "transaction.processing",
          description: "Transaction has started processing",
          badge: "common",
        },
        {
          name: "transaction.completed",
          description: "Transaction successfully completed",
          badge: "common",
          example: {
            id: "evt_def456",
            type: "transaction.completed",
            data: {
              id: "txn_abc123",
              status: "completed",
              completed_at: "2024-12-16T15:35:00Z"
            }
          }
        },
        {
          name: "transaction.failed",
          description: "Transaction failed to complete",
          badge: "important",
          example: {
            id: "evt_ghi789",
            type: "transaction.failed",
            data: {
              id: "txn_abc123",
              status: "failed",
              error: {
                code: "insufficient_funds",
                message: "Insufficient balance"
              }
            }
          }
        },
      ]
    },
    {
      category: "Customers",
      items: [
        {
          name: "customer.created",
          description: "New customer account created",
          badge: "common",
        },
        {
          name: "customer.updated",
          description: "Customer information updated",
          badge: "common",
        },
        {
          name: "customer.verification.approved",
          description: "Customer verification approved",
          badge: "important",
        },
        {
          name: "customer.verification.rejected",
          description: "Customer verification rejected",
          badge: "important",
        },
      ]
    },
    {
      category: "Payouts",
      items: [
        {
          name: "payout.scheduled",
          description: "Payout has been scheduled",
          badge: "common",
        },
        {
          name: "payout.sent",
          description: "Payout sent to recipient",
          badge: "common",
        },
        {
          name: "payout.delivered",
          description: "Payout confirmed delivered",
          badge: "important",
        },
        {
          name: "payout.returned",
          description: "Payout returned (failed delivery)",
          badge: "important",
        },
      ]
    },
    {
      category: "Compliance",
      items: [
        {
          name: "kyc.pending",
          description: "KYC verification pending review",
          badge: "common",
        },
        {
          name: "kyc.approved",
          description: "KYC verification approved",
          badge: "important",
        },
        {
          name: "kyc.rejected",
          description: "KYC verification rejected",
          badge: "important",
        },
        {
          name: "aml.flagged",
          description: "Transaction flagged for AML review",
          badge: "important",
        },
      ]
    }
  ];

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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading">
              Webhook Event Types
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl">
              Complete list of all webhook events available in Soberana API. Subscribe to the events 
              relevant to your integration to receive real-time notifications.
            </p>
          </div>

          <Separator />

          {/* Events by Category */}
          {events.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-heading">
                {category.category}
              </h2>

              <div className="space-y-3">
                {category.items.map((event, eventIndex) => (
                  <Card key={eventIndex} className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-semibold text-primary">
                          {event.name}
                        </code>
                        {event.badge === 'common' && (
                          <Badge variant="outline" className="text-xs bg-muted">
                            Common
                          </Badge>
                        )}
                        {event.badge === 'important' && (
                          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                            Important
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>

                    {event.example && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Example payload:</p>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <pre className="text-xs overflow-x-auto">
                            <code className="text-foreground">
                              {JSON.stringify(event.example, null, 2)}
                            </code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {categoryIndex < events.length - 1 && <Separator />}
            </div>
          ))}

          {/* Event Response */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Responding to Events
            </h2>

            <p className="text-muted-foreground">
              Your webhook endpoint should respond with a <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">200 OK</code> status 
              code to acknowledge receipt of the event:
            </p>

            <CodeBlock 
              code={`// Express.js example
app.post('/webhooks/soberana', (req, res) => {
  const event = req.body;
  
  // Process event based on type
  switch(event.type) {
    case 'transaction.completed':
      handleTransactionCompleted(event.data);
      break;
    case 'transaction.failed':
      handleTransactionFailed(event.data);
      break;
    case 'customer.verification.approved':
      handleCustomerVerified(event.data);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
  
  // Always respond with 200
  res.status(200).json({ received: true });
});`}
              language="javascript"
              filename="handle-webhooks.js"
            />
          </div>

          {/* Testing Webhooks */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Testing Webhooks
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use our dashboard to send test webhook events to your endpoint. This helps you 
              develop and debug your webhook handler before going live.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Navigate to <strong className="text-foreground">Settings → Webhooks</strong></p>
              <p>• Select your webhook endpoint</p>
              <p>• Click <strong className="text-foreground">Send Test Event</strong></p>
              <p>• Choose an event type and view the response</p>
            </div>
          </Card>
        </div>
      </motion.main>

      {/* Right column - empty */}
      <div className="hidden xl:block w-[480px] shrink-0" />
    </div>
  );
}
