/**
 * API Docs: Off-Ramp Transaction
 * 
 * POST /transactions/off-ramp endpoint documentation
 * Convert cryptocurrency to fiat currency
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

export default function OffRampTransactionPage() {
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
      description: 'Cryptocurrency ticker symbol.',
      example: 'USDT',
      enum: ['USDT', 'USDC', 'BTC', 'ETH'],
    },
    {
      name: 'targetCurrency',
      type: 'string',
      required: true,
      description: 'Fiat currency code (ISO 4217).',
      example: 'USD',
      enum: ['USD', 'BRL', 'EUR', 'MXN', 'COP', 'ARS', 'CLP'],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      description: 'Amount in source cryptocurrency to convert.',
      example: '1000.00',
    },
    {
      name: 'walletAddress',
      type: 'string',
      required: true,
      description: 'Source cryptocurrency wallet address to debit from.',
      example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    },
    {
      name: 'bankAccountId',
      type: 'string',
      required: true,
      description: 'Bank account ID to credit fiat to.',
      example: 'acc_1234567890',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 201,
      label: 'Created',
      description: 'Off-ramp transaction created successfully.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "txn_offramp_xyz789",
          type: "off-ramp",
          customerId: "3c90c3cc-0d44-4b50-8888-8dd25736052a",
          sourceCurrency: "USDT",
          targetCurrency: "USD",
          sourceAmount: 1000.00,
          targetAmount: 980.00,
          exchangeRate: 0.98,
          fee: 20.00,
          status: "processing",
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          bankAccountId: "acc_1234567890",
          estimatedCompletionTime: "2024-12-16T12:30:00Z",
          createdAt: "2024-12-16T10:30:00Z"
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X POST "https://globalconnectors.loopay.com/v1/transactions/off-ramp" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: unique-key-67890" \\
  -d '{
    "customerId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "sourceCurrency": "USDT",
    "targetCurrency": "USD",
    "amount": 1000.00,
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "bankAccountId": "acc_1234567890"
  }'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/transactions/off-ramp',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID()
    },
    body: JSON.stringify({
      customerId: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
      sourceCurrency: 'USDT',
      targetCurrency: 'USD',
      amount: 1000.00,
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      bankAccountId: 'acc_1234567890'
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

url = "https://globalconnectors.loopay.com/v1/transactions/off-ramp"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json",
    "Idempotency-Key": str(uuid.uuid4())
}
payload = {
    "customerId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "sourceCurrency": "USDT",
    "targetCurrency": "USD",
    "amount": 1000.00,
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "bankAccountId": "acc_1234567890"
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
            endpoint="https://globalconnectors.loopay.com/v1/transactions/off-ramp"
            title="Off-Ramp Transaction"
            description="Convert cryptocurrency to fiat currency. Debit from a crypto wallet and credit to a bank account."
          />

          <Separator />

          <ParameterList title="Body Parameters" parameters={bodyParameters} />

          <Separator />

          <ResponseVisualizer title="Response" responses={responses} />

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">📘 Notes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Off-ramp transactions typically complete within 1-3 business days</li>
              <li>• A fee of 2-3% is applied to cover network and processing costs</li>
              <li>• Wallet address must be verified and funded before initiating</li>
              <li>• Bank account must match the customer's verified identity</li>
            </ul>
          </div>

          <ApiPagination />
        </div>
      </motion.main>

      <StickyCodeRail
        requestTitle="Off-ramp"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
