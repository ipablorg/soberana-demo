/**
 * Debug Panel Component (TEMPORARY - REMOVE IN PRODUCTION)
 * 
 * Helps diagnose GlobalConnectors mutation issues
 */

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { getHeaders, hasAuthToken, setCompanyHeader } from '@/shared/lib/graphql-client';
import { useAuth } from '@/shared/hooks/use-auth';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Copy, Check, AlertCircle, CheckCircle2 } from '@/shared/components/animated-icons';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { CREATE_PAYMENT_FLOW } from '@/graphql/mutations/globalconnectors';
import type { CreatePaymentFlowInput, PaymentFlowResponse } from '@/shared/types/globalconnectors.types';

interface CreatePaymentResponse {
  globalconnectors_createPaymentFlow: PaymentFlowResponse;
}

export function DebugPanel() {
  const { user } = useAuth();
  const authState = useAuthStore.getState();
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Set company header (required by backend)
  useEffect(() => {
    const companyId = authState.user?.company_user?.[0]?.company?.id;
    if (companyId) {
      setCompanyHeader(companyId.toString());
    }
  }, [authState.user]);

  const createPayment = useGraphQLMutation<CreatePaymentResponse, { input: CreatePaymentFlowInput }>(
    CREATE_PAYMENT_FLOW as never
  );

  const headers = getHeaders();
  const isAuthenticated = hasAuthToken();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTestMutation = async () => {
    setIsTestRunning(true);
    setTestResult(null);

    try {
      const testInput: CreatePaymentFlowInput = {
        customerEmail: user?.email || 'test@example.com',
        customerName: user?.name || 'Test User',
        customerType: 'INDIVIDUAL',
        sourceCurrency: 'EUR',
        sourceCountry: 'Spain',
        destinationCurrency: 'USD',
        destinationCountry: 'USA',
        destinationAccountOwnerName: 'John Doe',
        destinationFirstName: 'John',
        destinationLastName: 'Doe',
        destinationBankName: 'Chase Bank',
        destinationPaymentRail: 'ACH',
        destinationAccountDetails: {
          routingNumber: '021000021',
          accountNumber: '1234567890',
          accountType: 'CHECKING',
        },
      };


      const result = await createPayment.mutateAsync({ input: testInput });

      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('❌ Test Error:', error);
      setTestResult(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestRunning(false);
    }
  };

  return (
    <Card className="border-2 border-warning/50 bg-warning/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <CardTitle className="text-lg">🔧 Debug Panel (TEMPORARY)</CardTitle>
          <Badge variant="destructive" className="text-xs">
            REMOVE IN PRODUCTION
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Authentication Status */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            {isAuthenticated ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            Authentication Status
          </h4>
          <div className="pl-6 space-y-1 font-mono text-xs">
            <p>
              <strong>Has Token:</strong>{' '}
              <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
                {isAuthenticated ? 'YES ✅' : 'NO ❌'}
              </Badge>
            </p>
            <p>
              <strong>User Email:</strong> {user?.email || 'Not logged in'}
            </p>
            <p>
              <strong>User Name:</strong> {user?.name || 'N/A'}
            </p>
          </div>
        </div>

        {/* GraphQL Headers */}
        <div className="space-y-2">
          <h4 className="font-semibold">GraphQL Client Headers</h4>
          <div className="bg-background p-3 rounded-md border font-mono text-xs overflow-x-auto">
            <pre>{JSON.stringify(headers, null, 2)}</pre>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(JSON.stringify(headers, null, 2))}
            className="h-7 text-xs"
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? 'Copied!' : 'Copy Headers'}
          </Button>
        </div>

        {/* Environment */}
        <div className="space-y-2">
          <h4 className="font-semibold">Environment</h4>
          <div className="pl-6 space-y-1 font-mono text-xs">
            <p>
              <strong>GraphQL URL:</strong> {import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql'}
            </p>
            <p>
              <strong>Mode:</strong> {import.meta.env.MODE}
            </p>
          </div>
        </div>

        {/* Test Mutation */}
        <div className="space-y-2">
          <h4 className="font-semibold">Test Mutation</h4>
          <Button
            size="sm"
            onClick={runTestMutation}
            disabled={isTestRunning || !isAuthenticated}
            className="w-full"
          >
            {isTestRunning ? 'Running Test...' : '🧪 Run Test Mutation'}
          </Button>
          
          {!isAuthenticated && (
            <p className="text-xs text-destructive">
              ⚠️ You must be logged in to test the mutation
            </p>
          )}

          {testResult && (
            <div className="space-y-2">
              <p className="text-xs font-semibold">Test Result:</p>
              <div className="bg-background p-3 rounded-md border font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                <pre>{testResult}</pre>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(testResult)}
                className="h-7 text-xs"
              >
                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? 'Copied!' : 'Copy Result'}
              </Button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-background rounded-md border space-y-2">
          <h4 className="font-semibold text-xs">📋 Next Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
            <li>Verify authentication status is ✅</li>
            <li>Check headers have Authorization and x-company-id</li>
            <li>Run test mutation</li>
            <li>If it works here but not in form, check form data</li>
            <li>Check browser DevTools Network tab for errors</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

