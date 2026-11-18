/**
 * API Docs: On-Ramp Transaction
 * 
 * POST /transactions/on-ramp endpoint documentation
 * Convert fiat currency to cryptocurrency
 */

import { motion } from 'framer-motion';
import { 
  ApiHeader, 
  ParameterList,
  ResponseVisualizer, 
  StickyCodeRail,
  ApiPagination,
  type ParameterProperty,
  type ResponseExample,
  type CodeExample
} from '@/modules/documentation/components/api';
import { Separator } from '@/shared/components/ui/separator';

export default function OnRampTransactionPage() {
  // Body Parameters
  const bodyParameters: ParameterProperty[] = [
    {
      name: 'customerId',
      type: 'string<uuid>',
      required: true,
      description: 'The unique identifier of the customer initiating the transaction.',
      example: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    },
    {
      name: 'sourceCurrency',
      type: 'string',
      required: true,
      description: 'Fiat currency code (ISO 4217).',
      example: 'USD',
      enum: ['USD', 'BRL', 'EUR', 'MXN', 'COP', 'ARS', 'CLP'],
    },
    {
      name: 'targetCurrency',
      type: 'string',
      required: true,
      description: 'Cryptocurrency ticker symbol.',
      example: 'USDT',
      enum: ['USDT', 'USDC', 'BTC', 'ETH'],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      description: 'Amount in source currency to convert.',
      example: '1000.00',
    },
    {
      name: 'bankAccountId',
      type: 'string',
      required: true,
      description: 'Bank account ID to debit fiat from.',
      example: 'acc_1234567890',
    },
    {
      name: 'walletAddress',
      type: 'string',
      required: true,
      description: 'Destination cryptocurrency wallet address.',
      example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    },
  ];

  // Header Parameters
  const headerParameters: ParameterProperty[] = [
    {
      name: 'Authorization',
      type: 'string',
      required: true,
      description: 'Bearer authentication header.',
      example: 'Bearer sk_live_abc123...',
    },
    {
      name: 'Idempotency-Key',
      type: 'string',
      required: false,
      description: 'Unique key to prevent duplicate transactions.',
      example: 'unique-key-12345',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 201,
      label: 'Created',
      description: 'On-ramp transaction created successfully.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "txn_onramp_abc123",
          type: "on-ramp",
          customerId: "3c90c3cc-0d44-4b50-8888-8dd25736052a",
          sourceCurrency: "USD",
          targetCurrency: "USDT",
          sourceAmount: 1000.00,
          targetAmount: 990.00,
          exchangeRate: 0.99,
          fee: 10.00,
          status: "processing",
          bankAccountId: "acc_1234567890",
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          estimatedCompletionTime: "2024-12-16T11:30:00Z",
          createdAt: "2024-12-16T10:30:00Z"
        }
      }, null, 2),
    },
    {
      statusCode: 400,
      label: 'Bad Request',
      description: 'Invalid parameters or insufficient funds.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "validation_error",
          message: "Insufficient funds in bank account",
          details: {
            field: "bankAccountId",
            available: 500.00,
            required: 1000.00
          }
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X POST "https://globalconnectors.loopay.com/v1/transactions/on-ramp" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: unique-key-12345" \\
  -d '{
    "customerId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "sourceCurrency": "USD",
    "targetCurrency": "USDT",
    "amount": 1000.00,
    "bankAccountId": "acc_1234567890",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/transactions/on-ramp',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID()
    },
    body: JSON.stringify({
      customerId: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
      sourceCurrency: 'USD',
      targetCurrency: 'USDT',
      amount: 1000.00,
      bankAccountId: 'acc_1234567890',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    })
  }
);

const data = await response.json();
console.log(data);`,
    },
    {
      language: 'python',
      label: 'Python',
      code: `import requests
import uuid

url = "https://globalconnectors.loopay.com/v1/transactions/on-ramp"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json",
    "Idempotency-Key": str(uuid.uuid4())
}
payload = {
    "customerId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "sourceCurrency": "USD",
    "targetCurrency": "USDT",
    "amount": 1000.00,
    "bankAccountId": "acc_1234567890",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)`,
    },
  ];

  return (
    <div className="flex w-full items-start gap-6 lg:gap-8 flex-wrap xl:flex-nowrap">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0 px-6 py-6 lg:px-10 max-w-4xl"
      >
        <div className="space-y-6">
          <ApiHeader
            method="POST"
            endpoint="https://globalconnectors.loopay.com/v1/transactions/on-ramp"
            title="On-Ramp Transaction"
            description="Convert fiat currency to cryptocurrency. Debit from a bank account and credit to a crypto wallet."
          />

          <Separator />

          <ParameterList title="Body Parameters" parameters={bodyParameters} />
          <ParameterList title="Headers" parameters={headerParameters} />

          <Separator />

          <ResponseVisualizer title="Response" responses={responses} />

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">📘 Notes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• On-ramp transactions typically complete within 15-30 minutes</li>
              <li>• A fee of 1-2% is applied to the source amount</li>
              <li>• Bank account must be verified before initiating transactions</li>
              <li>• Use idempotency keys to prevent duplicate transactions</li>
            </ul>
          </div>

          <ApiPagination />
        </div>
      </motion.main>

      <StickyCodeRail
        requestTitle="On-ramp"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
