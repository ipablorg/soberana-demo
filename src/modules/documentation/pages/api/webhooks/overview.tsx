/**
 * API Webhooks Overview Page
 * 
 * Documentation for webhooks setup and usage
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { CodeBlock } from '@/modules/documentation/components/CodeBlock';
import { 
  Webhook, 
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from '@/shared/components/animated-icons';
import { Separator } from '@/shared/components/ui/separator';

export default function WebhooksOverviewPage() {
  const webhookPayloadExample = JSON.stringify({
    id: "evt_abc123def456",
    type: "transaction.completed",
    created_at: "2024-12-16T15:30:00Z",
    data: {
      id: "txn_abc123",
      type: "payout",
      status: "completed",
      amount: "1000.00",
      currency: "USD",
      customer_id: "cust_abc123",
      completed_at: "2024-12-16T15:35:00Z"
    }
  }, null, 2);

  const verificationExample = `const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// In your webhook endpoint
app.post('/webhooks/soberana', (req, res) => {
  const signature = req.headers['x-soberana-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook event
  const event = req.body;
  console.log('Received event:', event.type);
  
  res.status(200).json({ received: true });
});`;

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
              <Webhook className="h-3 w-3 mr-1" />
              Webhooks
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading">
              Webhooks
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl">
              Webhooks allow you to receive real-time notifications about events in your Soberana account. 
              Instead of polling the API, webhooks push data to your server automatically.
            </p>
          </div>

          <Separator />

          {/* How Webhooks Work */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              How Webhooks Work
            </h2>

            <div className="grid gap-4">
              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-muted shrink-0">
                    <span className="text-lg font-bold text-foreground">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Configure Webhook Endpoint</h3>
                    <p className="text-sm text-muted-foreground">
                      Set up a public HTTPS endpoint on your server to receive webhook events. 
                      Configure this URL in your Soberana dashboard.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-muted shrink-0">
                    <span className="text-lg font-bold text-foreground">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Event Occurs</h3>
                    <p className="text-sm text-muted-foreground">
                      When an event happens (e.g., transaction completed, customer created), 
                      Soberana generates a webhook event.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-muted shrink-0">
                    <span className="text-lg font-bold text-foreground">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">We Send HTTP POST</h3>
                    <p className="text-sm text-muted-foreground">
                      Soberana sends an HTTP POST request to your endpoint with the event data 
                      and a signature for verification.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-muted shrink-0">
                    <span className="text-lg font-bold text-foreground">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Verify and Process</h3>
                    <p className="text-sm text-muted-foreground">
                      Your server verifies the signature, processes the event, 
                      and returns a 200 OK response.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Webhook Payload */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Webhook Payload Structure
            </h2>

            <p className="text-muted-foreground">
              All webhook events follow this structure:
            </p>

            <CodeBlock 
              code={webhookPayloadExample}
              language="json"
              filename="webhook-payload.json"
            />

            <div className="grid gap-3 mt-4">
              <div className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <code className="font-mono text-sm text-foreground font-medium min-w-[140px]">id</code>
                <p className="text-sm text-muted-foreground">Unique event identifier (starts with evt_)</p>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <code className="font-mono text-sm text-foreground font-medium min-w-[140px]">type</code>
                <p className="text-sm text-muted-foreground">Event type (e.g., transaction.completed)</p>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <code className="font-mono text-sm text-foreground font-medium min-w-[140px]">created_at</code>
                <p className="text-sm text-muted-foreground">ISO 8601 timestamp of when the event occurred</p>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <code className="font-mono text-sm text-foreground font-medium min-w-[140px]">data</code>
                <p className="text-sm text-muted-foreground">Event-specific data (transaction, customer, etc.)</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Signature Verification */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-success" />
              Signature Verification
            </h2>

            <p className="text-muted-foreground">
              Every webhook includes a signature in the <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">X-Soberana-Signature</code> header. 
              Always verify this signature to ensure the request came from Soberana:
            </p>

            <CodeBlock 
              code={verificationExample}
              language="javascript"
              filename="verify-webhook.js"
            />
          </div>

          <Separator />

          {/* Best Practices */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Best Practices
            </h2>

            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Always Verify Signatures
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Never process webhook events without verifying the signature first.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Respond Quickly (Within 5 Seconds)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Return a 200 OK response immediately. Process events asynchronously if needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Handle Duplicate Events
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Webhooks may be sent multiple times. Use event IDs to deduplicate.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Use HTTPS Only
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Webhook endpoints must use HTTPS for security.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Monitor Webhook Failures
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check your dashboard for failed webhook deliveries and retry manually if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Retry Logic */}
          <Card className="p-6 bg-warning/5 border-warning/20">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Automatic Retries
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              If your endpoint fails to respond with 200 OK, Soberana will automatically retry 
              with exponential backoff:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 1st retry: after 1 minute</li>
              <li>• 2nd retry: after 5 minutes</li>
              <li>• 3rd retry: after 30 minutes</li>
              <li>• 4th retry: after 2 hours</li>
              <li>• 5th retry: after 6 hours</li>
            </ul>
          </Card>

          {/* Next Steps */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Next Steps
            </h2>

            <Link 
              to="/globalconnectors/api/webhooks/events"
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
            >
              <div>
                <h3 className="font-semibold text-foreground">Available Webhook Events</h3>
                <p className="text-sm text-muted-foreground">See the complete list of events you can subscribe to</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        </div>
      </motion.main>

      {/* Right column - empty */}
      <div className="hidden xl:block w-[480px] shrink-0" />
    </div>
  );
}
