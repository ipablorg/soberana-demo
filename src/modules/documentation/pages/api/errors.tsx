/**
 * API Errors Page
 * 
 * Complete documentation of error codes, formats, and handling strategies
 */

import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';
import { CodeBlock } from '@/modules/documentation/components/CodeBlock';
import { 
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Clock,
  ServerCrash
} from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export default function ErrorsPage() {
  const errorResponseExample = `{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Email address is already registered"
    },
    "request_id": "req_1234567890abcdef"
  }
}`;

  const rateLimitExample = `{
  "success": false,
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}`;

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
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Error Handling
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading">
              Errors
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl">
              Learn about error codes, response formats, and best practices for handling 
              errors when working with the Global Connectors API.
            </p>
          </div>

          <Separator />

          {/* Error Response Format */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Error Response Format
            </h2>
            
            <p className="text-muted-foreground">
              All API errors follow a consistent JSON structure:
            </p>

            <CodeBlock code={errorResponseExample} language="json" filename="error_response.json" />

            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <code className="font-mono text-sm font-semibold text-primary shrink-0 mt-0.5">success</code>
                <div>
                  <Badge variant="outline" className="text-xs bg-muted mb-2">boolean</Badge>
                  <p className="text-sm text-muted-foreground">
                    Always <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">false</code> for error responses
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <code className="font-mono text-sm font-semibold text-primary shrink-0 mt-0.5">error.code</code>
                <div>
                  <Badge variant="outline" className="text-xs bg-muted mb-2">string</Badge>
                  <p className="text-sm text-muted-foreground">
                    Machine-readable error code for programmatic handling
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <code className="font-mono text-sm font-semibold text-primary shrink-0 mt-0.5">error.message</code>
                <div>
                  <Badge variant="outline" className="text-xs bg-muted mb-2">string</Badge>
                  <p className="text-sm text-muted-foreground">
                    Human-readable error description
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <code className="font-mono text-sm font-semibold text-primary shrink-0 mt-0.5">error.details</code>
                <div>
                  <Badge variant="outline" className="text-xs bg-muted mb-2">object (optional)</Badge>
                  <p className="text-sm text-muted-foreground">
                    Additional context about the error (field-specific validation errors, etc.)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* HTTP Status Codes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              HTTP Status Codes
            </h2>
            
            <p className="text-muted-foreground">
              The API uses standard HTTP status codes to indicate success or failure:
            </p>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[180px]">Category</TableHead>
                    <TableHead>Meaning</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-success/10 text-success border-success/20">
                        200
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">OK</TableCell>
                    <TableCell className="text-muted-foreground">Request succeeded</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-success/10 text-success border-success/20">
                        201
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">Created</TableCell>
                    <TableCell className="text-muted-foreground">Resource was created successfully</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-warning/10 text-warning border-warning/20">
                        400
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">Bad Request</TableCell>
                    <TableCell className="text-muted-foreground">Invalid request parameters or malformed JSON</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-destructive/10 text-destructive border-destructive/20">
                        401
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">Unauthorized</TableCell>
                    <TableCell className="text-muted-foreground">Missing or invalid API key</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-destructive/10 text-destructive border-destructive/20">
                        403
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">Forbidden</TableCell>
                    <TableCell className="text-muted-foreground">Authenticated but lacks permissions for this resource</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-destructive/10 text-destructive border-destructive/20">
                        404
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">Not Found</TableCell>
                    <TableCell className="text-muted-foreground">Resource does not exist</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-destructive/10 text-destructive border-destructive/20">
                        429
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">Too Many Requests</TableCell>
                    <TableCell className="text-muted-foreground">Rate limit exceeded</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-destructive/10 text-destructive border-destructive/20">
                        500
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">Internal Server Error</TableCell>
                    <TableCell className="text-muted-foreground">Something went wrong on our end</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-destructive/10 text-destructive border-destructive/20">
                        503
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">Service Unavailable</TableCell>
                    <TableCell className="text-muted-foreground">API is temporarily unavailable (maintenance or overload)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Common Error Codes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Common Error Codes
            </h2>
            
            <p className="text-muted-foreground">
              Application-level error codes returned in the <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">error.code</code> field:
            </p>

            <div className="grid gap-4">
              {/* Validation Error */}
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warning/10 shrink-0">
                    <XCircle className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="font-mono text-sm font-semibold text-foreground">validation_error</code>
                      <Badge variant="outline" className="text-xs">400</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Request contains invalid or missing required parameters. Check <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">error.details</code> for field-specific issues.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Unauthorized */}
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="font-mono text-sm font-semibold text-foreground">unauthorized</code>
                      <Badge variant="outline" className="text-xs">401</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Invalid or missing API key. Ensure your Authorization header is correct.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Resource Not Found */}
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="font-mono text-sm font-semibold text-foreground">resource_not_found</code>
                      <Badge variant="outline" className="text-xs">404</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The requested resource (customer, transaction, etc.) does not exist.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Rate Limit Exceeded */}
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warning/10 shrink-0">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="font-mono text-sm font-semibold text-foreground">rate_limit_exceeded</code>
                      <Badge variant="outline" className="text-xs">429</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You've exceeded the rate limit. Wait for the time specified in <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">retry_after</code> before retrying.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Internal Server Error */}
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                    <ServerCrash className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="font-mono text-sm font-semibold text-foreground">internal_server_error</code>
                      <Badge variant="outline" className="text-xs">500</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      An unexpected error occurred on our servers. If this persists, contact support with the <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">request_id</code>.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Rate Limit Errors */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Rate Limit Errors
            </h2>
            
            <p className="text-muted-foreground">
              When you exceed the rate limit, the API returns a 429 status with a <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">retry_after</code> field:
            </p>

            <CodeBlock code={rateLimitExample} language="json" filename="rate_limit_error.json" />

            <Card className="p-5 bg-warning/5 border-warning/20">
              <h3 className="font-semibold text-foreground mb-2">Handling Rate Limits</h3>
              <p className="text-sm text-muted-foreground">
                Implement exponential backoff in your application. Respect the <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">retry_after</code> value 
                (in seconds) before retrying the request.
              </p>
            </Card>
          </div>

          <Separator />

          {/* Best Practices */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Error Handling Best Practices
            </h2>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">1.</span>
                  <span>
                    <strong className="text-foreground">Always check HTTP status codes</strong> before parsing the response body
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">2.</span>
                  <span>
                    <strong className="text-foreground">Log error details</strong> including <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">request_id</code> for debugging
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">3.</span>
                  <span>
                    <strong className="text-foreground">Implement retry logic</strong> with exponential backoff for 429 and 5xx errors
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">4.</span>
                  <span>
                    <strong className="text-foreground">Display user-friendly messages</strong> instead of raw API error text
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">5.</span>
                  <span>
                    <strong className="text-foreground">Handle network errors</strong> (timeouts, connection failures) gracefully
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">6.</span>
                  <span>
                    <strong className="text-foreground">Validate input client-side</strong> to reduce 400 errors and improve UX
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </motion.main>

      {/* Right column - empty for consistency */}
      <div className="hidden xl:block w-[480px] shrink-0" />
    </div>
  );
}
