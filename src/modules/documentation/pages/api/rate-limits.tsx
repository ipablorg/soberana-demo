/**
 * API Rate Limits Page
 * 
 * Documentation for API rate limits and best practices
 */

import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Zap, 
  AlertTriangle,
  Clock,
  TrendingUp
} from '@/shared/components/animated-icons';
import { Separator } from '@/shared/components/ui/separator';

export default function RateLimitsPage() {
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
            <Badge className="bg-warning/10 text-warning border-warning/20">
              <Clock className="h-3 w-3 mr-1" />
              Rate Limits
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading">
              Rate Limits
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl">
              Soberana API implements rate limiting to ensure fair usage and maintain service quality 
              for all users. Learn how to handle rate limits effectively.
            </p>
          </div>

          <Separator />

          {/* Current Limits */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Current Rate Limits
            </h2>

            <div className="grid gap-4">
              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-success/10 shrink-0">
                    <Zap className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">Standard Tier</h3>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                        Default
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Default rate limit for all API keys
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-foreground font-mono tabular-nums">100</p>
                        <p className="text-xs text-muted-foreground">requests per minute</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground font-mono tabular-nums">10,000</p>
                        <p className="text-xs text-muted-foreground">requests per day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">Enterprise Tier</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                        Contact Sales
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Higher limits for enterprise customers
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-foreground font-mono tabular-nums">1,000</p>
                        <p className="text-xs text-muted-foreground">requests per minute</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground font-mono tabular-nums">100,000</p>
                        <p className="text-xs text-muted-foreground">requests per day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Rate Limit Headers */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Rate Limit Headers
            </h2>

            <p className="text-muted-foreground">
              Every API response includes headers that provide information about your current rate limit status:
            </p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="divide-y divide-border">
                <div className="p-4 flex items-start gap-4">
                  <code className="font-mono text-sm text-primary font-semibold min-w-[200px]">
                    X-RateLimit-Limit
                  </code>
                  <p className="text-sm text-muted-foreground">
                    The maximum number of requests allowed per minute
                  </p>
                </div>
                <div className="p-4 flex items-start gap-4">
                  <code className="font-mono text-sm text-primary font-semibold min-w-[200px]">
                    X-RateLimit-Remaining
                  </code>
                  <p className="text-sm text-muted-foreground">
                    The number of requests remaining in the current rate limit window
                  </p>
                </div>
                <div className="p-4 flex items-start gap-4">
                  <code className="font-mono text-sm text-primary font-semibold min-w-[200px]">
                    X-RateLimit-Reset
                  </code>
                  <p className="text-sm text-muted-foreground">
                    The time at which the current rate limit window resets (Unix timestamp)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Handling Rate Limits */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Handling Rate Limit Errors
            </h2>

            <p className="text-muted-foreground">
              When you exceed the rate limit, the API returns a <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">429 Too Many Requests</code> response:
            </p>

            <Card className="p-4 bg-muted/50 border">
              <pre className="text-sm overflow-x-auto">
                <code className="text-foreground">{JSON.stringify({
                  success: false,
                  error: {
                    code: "rate_limit_exceeded",
                    message: "You have exceeded the rate limit. Please retry after 60 seconds."
                  }
                }, null, 2)}</code>
              </pre>
            </Card>

            <Card className="p-6 bg-warning/5 border-warning/20 mt-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Retry-After Header
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The response includes a <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">Retry-After</code> header 
                    indicating how many seconds to wait before making another request.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Best Practices */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Best Practices
            </h2>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="p-1 rounded-lg bg-primary/10 h-fit mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Implement Exponential Backoff
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    If you receive a 429 response, wait before retrying. Use exponential backoff: 
                    wait 1s, then 2s, then 4s, etc.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-1 rounded-lg bg-primary/10 h-fit mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Monitor Rate Limit Headers
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">X-RateLimit-Remaining</code> before 
                    making requests to avoid hitting limits.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-1 rounded-lg bg-primary/10 h-fit mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Cache Responses When Possible
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Cache frequently accessed data to reduce API calls. Most data changes infrequently.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-1 rounded-lg bg-primary/10 h-fit mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Use Webhooks for Real-Time Updates
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Instead of polling, use webhooks to receive real-time notifications about events.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-1 rounded-lg bg-primary/10 h-fit mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Batch Operations When Available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use batch endpoints when creating or updating multiple resources to reduce total requests.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Need Higher Limits */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Need Higher Limits?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you're building a high-volume application and need higher rate limits, 
              please contact our sales team to discuss enterprise options.
            </p>
            <a 
              href="mailto:sales@loopay.com" 
              className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
            >
              Contact Sales →
            </a>
          </Card>
        </div>
      </motion.main>

      {/* Right column - empty */}
      <div className="hidden xl:block w-[480px] shrink-0" />
    </div>
  );
}
