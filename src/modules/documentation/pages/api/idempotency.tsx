/**
 * API Idempotency Page
 * 
 * Documentation for idempotent requests using Idempotency-Key header
 */

import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';
import { CodeBlock } from '@/modules/documentation/components/CodeBlock';
import { 
  Key, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

export default function IdempotencyPage() {
  const curlExample = `curl -X POST "https://globalconnectors.loopay.com/v1/transactions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Idempotency-Key: unique-key-12345" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000.00,
    "currency": "USD",
    "type": "on-ramp"
  }'`;

  const jsExample = `const idempotencyKey = crypto.randomUUID(); // Generate unique key

const response = await fetch(
  'https://globalconnectors.loopay.com/v1/transactions',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Idempotency-Key': idempotencyKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 1000.00,
      currency: 'USD',
      type: 'on-ramp'
    })
  }
);`;

  const pythonExample = `import uuid
import requests

# Generate unique idempotency key
idempotency_key = str(uuid.uuid4())

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Idempotency-Key': idempotency_key,
    'Content-Type': 'application/json'
}

payload = {
    'amount': 1000.00,
    'currency': 'USD',
    'type': 'on-ramp'
}

response = requests.post(
    'https://globalconnectors.loopay.com/v1/transactions',
    headers=headers,
    json=payload
)`;

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
              <RefreshCw className="h-3 w-3 mr-1" />
              Idempotency
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading">
              Idempotency
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl">
              Prevent duplicate operations by using idempotency keys. If a request fails due to network 
              issues, you can safely retry it with the same key without creating duplicate resources.
            </p>
          </div>

          <Separator />

          {/* What is Idempotency */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              What is Idempotency?
            </h2>
            
            <p className="text-muted-foreground">
              Idempotency ensures that multiple identical requests have the same effect as making a single request. 
              This is crucial for financial operations where duplicate transactions could cause serious issues.
            </p>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Safe to Retry
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    With idempotency keys, you can safely retry failed requests without worrying about 
                    creating duplicate transactions or charging customers twice.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* How to Use */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              How to Use Idempotency Keys
            </h2>
            
            <p className="text-muted-foreground">
              Include an <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">Idempotency-Key</code> header 
              with a unique value (UUID recommended) in your POST requests:
            </p>

            <CodeBlock code={curlExample} language="bash" filename="curl" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">JavaScript</h3>
                <CodeBlock code={jsExample} language="javascript" />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Python</h3>
                <CodeBlock code={pythonExample} language="python" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Supported Endpoints */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Supported Endpoints
            </h2>

            <p className="text-muted-foreground">
              Idempotency keys are supported on all POST endpoints that create or modify resources:
            </p>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="divide-y divide-border">
                <div className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs bg-chart-1/10 text-chart-1 border-chart-1/20">
                      POST
                    </Badge>
                    <code className="text-sm font-mono">/v1/customers</code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Create a new customer</p>
                </div>

                <div className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs bg-chart-1/10 text-chart-1 border-chart-1/20">
                      POST
                    </Badge>
                    <code className="text-sm font-mono">/v1/bank-accounts</code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Create a bank account</p>
                </div>

                <div className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs bg-chart-1/10 text-chart-1 border-chart-1/20">
                      POST
                    </Badge>
                    <code className="text-sm font-mono">/v1/transactions</code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Create a transaction (on-ramp, off-ramp, transfer)</p>
                </div>

                <div className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs bg-chart-1/10 text-chart-1 border-chart-1/20">
                      POST
                    </Badge>
                    <code className="text-sm font-mono">/v1/partner-fees</code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Create a partner fee</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* How It Works */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              How It Works
            </h2>

            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">First Request</h3>
                    <p className="text-sm text-muted-foreground">
                      You send a POST request with an <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">Idempotency-Key</code>. 
                      The API processes the request and stores the key along with the response.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Retry with Same Key</h3>
                    <p className="text-sm text-muted-foreground">
                      If you retry the request with the same <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">Idempotency-Key</code>, 
                      the API returns the cached response from the first request without creating a duplicate resource.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Key Expiration</h3>
                    <p className="text-sm text-muted-foreground">
                      Idempotency keys are stored for 24 hours. After that, using the same key will create a new resource.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Best Practices */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Best Practices
            </h2>

            <Card className="p-6 bg-warning/5 border-warning/20">
              <div className="flex gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Important Guidelines
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-warning">•</span>
                  <span>
                    <strong className="text-foreground">Use UUIDs:</strong> Generate random UUIDs (v4) for each unique operation
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warning">•</span>
                  <span>
                    <strong className="text-foreground">Store keys:</strong> Save the idempotency key with your request data to retry with the same key if needed
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warning">•</span>
                  <span>
                    <strong className="text-foreground">Don't reuse keys:</strong> Each unique operation should have its own key
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warning">•</span>
                  <span>
                    <strong className="text-foreground">Max length:</strong> Keys must be 255 characters or less
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warning">•</span>
                  <span>
                    <strong className="text-foreground">Same payload:</strong> Retries must use the same request body as the original request
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          <Separator />

          {/* Conflict Response */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Conflict Response
            </h2>

            <p className="text-muted-foreground">
              If you retry with the same key but different request parameters, you'll receive a 409 Conflict error:
            </p>

            <CodeBlock 
              code={JSON.stringify({
                success: false,
                error: {
                  code: "idempotency_conflict",
                  message: "Idempotency key already used with different request parameters"
                }
              }, null, 2)}
              language="json"
              filename="409_conflict.json"
            />
          </div>
        </div>
      </motion.main>

      {/* Right column - empty for consistency */}
      <div className="hidden xl:block w-[480px] shrink-0" />
    </div>
  );
}
