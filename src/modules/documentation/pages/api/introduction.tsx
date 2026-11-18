/**
 * API Introduction Page
 * 
 * Landing page for the Soberana API documentation
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { CodeBlock } from '@/modules/documentation/components/CodeBlock';
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Sparkles,
  ArrowRight,
  Key,
  BookOpen
} from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';

export default function ApiIntroductionPage() {
  const quickStartCode = `curl -X GET "https://globalconnectors.loopay.com/v1/customers" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

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
              <Sparkles className="h-3 w-3 mr-1" />
              Soberana API v1
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading">
              Soberana API Reference
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl">
              Build global payment solutions with Soberana's RESTful API. Access payment rails in 
              200+ countries, process transactions, manage customers, and more.
            </p>
          </div>

          {/* Base URL */}
          <Card className="p-6 bg-muted/30">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Base URL
              </h2>
              <code className="block text-lg font-mono font-semibold text-primary">
                https://globalconnectors.loopay.com/v1
              </code>
            </div>
          </Card>

          {/* Quick Start */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Quick Start
            </h2>
            
            <p className="text-muted-foreground">
              Make your first API call to retrieve a list of customers. All requests must include 
              an <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">Authorization</code> header 
              with your API key.
            </p>

            <CodeBlock code={quickStartCode} language="bash" />

            <div className="flex gap-3">
              <Button variant="gradient" asChild>
                <Link to="/globalconnectors/api/customers/list">
                  View Full Example
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Key Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-3">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Real-time Processing
                </h3>
                <p className="text-sm text-muted-foreground">
                  Process payments instantly with PIX, SPEI, and SEPA Instant rails.
                </p>
              </Card>

              <Card className="p-6">
                <div className="p-2 rounded-lg bg-success/10 w-fit mb-3">
                  <ShieldCheck className="h-5 w-5 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Enterprise Security
                </h3>
                <p className="text-sm text-muted-foreground">
                  Bank-level encryption, OAuth 2.0, and PCI DSS compliance.
                </p>
              </Card>

              <Card className="p-6">
                <div className="p-2 rounded-lg bg-warning/10 w-fit mb-3">
                  <Globe className="h-5 w-5 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Global Coverage
                </h3>
                <p className="text-sm text-muted-foreground">
                  200+ countries, 100+ currencies, and 50+ local payment methods.
                </p>
              </Card>
            </div>
          </div>

          {/* Getting Started Links */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">
              Getting Started
            </h2>

            <div className="grid gap-3">
              <Link 
                to="/globalconnectors/api/authentication"
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Authentication</h3>
                    <p className="text-sm text-muted-foreground">Learn how to authenticate API requests</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>

              <Link 
                to="/globalconnectors/api/customers/list"
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-success/10">
                    <BookOpen className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">List All Customers</h3>
                    <p className="text-sm text-muted-foreground">Retrieve and filter your customers</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </div>
          </div>

          {/* Need Help */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join our developer community on Discord or reach out to our support team.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                Join Discord
              </Button>
              <Button variant="ghost" size="sm">
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      </motion.main>

      {/* Right column - empty or can show quick links */}
      <div className="hidden xl:block w-[480px] shrink-0" />
    </div>
  );
}
