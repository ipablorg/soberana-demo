/**
 * API Authentication Page
 * 
 * Documentation for API authentication using Bearer tokens
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@/shared/components/ui/badge';
import { CodeBlock } from '@/modules/documentation/components/CodeBlock';
import { 
  Key, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2
} from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

export default function AuthenticationPage() {
  const curlExample = `curl -X GET "https://globalconnectors.loopay.com/v1/customers" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

  const jsExample = `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/customers',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);`;

  const pythonExample = `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://globalconnectors.loopay.com/v1/customers',
    headers=headers
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
              <Key className="h-3 w-3 mr-1" />
              Authentication
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading">
              Authentication
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl">
              Soberana API uses Bearer token authentication. All API requests must include a valid 
              API key in the Authorization header.
            </p>
          </div>

          <Separator />

          {/* Getting API Keys */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Getting Your API Key
            </h2>
            
            <p className="text-muted-foreground">
              To get started with Soberana API, you'll need to obtain an API key from your dashboard:
            </p>

            <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
              <li>Log in to your <Link to="/suite/dashboard" className="text-primary hover:underline">Loopay Dashboard</Link></li>
              <li>Navigate to <strong className="text-foreground">Settings → API Keys</strong></li>
              <li>Click <strong className="text-foreground">Create New API Key</strong></li>
              <li>Copy and securely store your API key (it won't be shown again)</li>
            </ol>

            <Card className="p-6 bg-warning/5 border-warning/20">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Keep your API keys secure
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Never share your API keys in public repositories, client-side code, or 
                    unsecured locations. Treat them like passwords.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Making Authenticated Requests */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Making Authenticated Requests
            </h2>
            
            <p className="text-muted-foreground">
              Include your API key in the <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">Authorization</code> header 
              of every request using the Bearer token format:
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

          {/* API Key Types */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              API Key Types
            </h2>

            <div className="grid gap-4">
              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-warning/10 shrink-0">
                    <Key className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">Test Keys</h3>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                        sk_test_...
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use test keys in development and testing environments. Test keys connect to our sandbox 
                      environment at <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">https://sandbox.globalconnectors.loopay.com</code>
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-success/10 shrink-0">
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">Live Keys</h3>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                        sk_live_...
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use live keys in production. Live keys process real transactions and connect to 
                      <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs"> https://globalconnectors.loopay.com</code>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Error Responses */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Authentication Errors
            </h2>

            <p className="text-muted-foreground">
              If authentication fails, the API will return a 401 Unauthorized response:
            </p>

            <CodeBlock 
              code={JSON.stringify({
                success: false,
                error: {
                  code: "unauthorized",
                  message: "Invalid authentication token. Please check your API key."
                }
              }, null, 2)}
              language="json"
              filename="response.json"
            />
          </div>

          {/* Best Practices */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Store API keys as environment variables, never in code</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Use different API keys for different environments (dev, staging, prod)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Rotate your API keys regularly (every 90 days recommended)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>If a key is compromised, revoke it immediately from the dashboard</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Monitor API key usage in your dashboard for suspicious activity</span>
              </li>
            </ul>
          </Card>

          {/* Next Steps */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Next Steps
            </h2>

            <p className="text-muted-foreground">
              Now that you understand authentication, you're ready to start making API requests:
            </p>

            <div className="grid gap-3">
              <Link 
                to="/globalconnectors/api/customers/list"
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
              >
                <div>
                  <h3 className="font-semibold text-foreground">List All Customers</h3>
                  <p className="text-sm text-muted-foreground">Learn how to retrieve customer data</p>
                </div>
              </Link>

              <Link 
                to="/globalconnectors/api/customers/create"
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
              >
                <div>
                  <h3 className="font-semibold text-foreground">Create a Customer</h3>
                  <p className="text-sm text-muted-foreground">Start by creating your first customer</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Right column - empty for consistency */}
      <div className="hidden xl:block w-[480px] shrink-0" />
    </div>
  );
}
