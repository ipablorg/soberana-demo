/**
 * API Docs: Create Transaction
 * 
 * POST /transactions endpoint documentation
 */

import { motion } from 'framer-motion';
import { 
  ApiHeader, 
  ParameterTable, 
  ResponseVisualizer, 
  StickyCodeRail,
  type Parameter,
  type ResponseExample,
  type CodeExample
} from '@/modules/documentation/components/api';
import { Separator } from '@/shared/components/ui/separator';

export default function CreateTransactionPage() {
  // Body Parameters
  const bodyParameters: Parameter[] = [
    {
      name: 'type',
      type: 'string',
      required: true,
      description: 'Transaction type. Values: payin, payout, transfer.',
      example: 'payout',
    },
    {
      name: 'customer_id',
      type: 'string',
      required: true,
      description: 'ID of the customer initiating the transaction.',
      example: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    },
    {
      name: 'amount',
      type: 'string',
      required: true,
      description: 'Transaction amount with 2 decimal places.',
      example: '1000.00',
    },
    {
      name: 'currency',
      type: 'string',
      required: true,
      description: 'ISO 4217 currency code (USD, EUR, GBP, etc.).',
      example: 'USD',
    },
    {
      name: 'payment_method',
      type: 'string',
      required: true,
      description: 'Payment method. Values: bank_transfer, card, crypto.',
      example: 'bank_transfer',
    },
    {
      name: 'recipient',
      type: 'object',
      required: true,
      description: 'Recipient details including name and account information.',
      example: '{"name": "John Doe", "account_number": "1234567890", "routing_number": "021000021"}',
    },
    {
      name: 'metadata',
      type: 'object',
      required: false,
      description: 'Custom metadata for the transaction.',
      example: '{"reference": "INV-001", "invoice_id": "inv_xyz789"}',
    },
  ];

  // Header Parameters
  const headerParameters: Parameter[] = [
    {
      name: 'Authorization',
      type: 'string',
      required: true,
      description: 'Bearer token for authentication.',
      example: 'Bearer sk_live_abc123...',
    },
    {
      name: 'Content-Type',
      type: 'string',
      required: true,
      description: 'Must be application/json.',
      defaultValue: 'application/json',
    },
    {
      name: 'Idempotency-Key',
      type: 'string',
      required: false,
      description: 'Unique key to prevent duplicate transactions.',
      example: 'key_abc123def456',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 201,
      label: 'Created',
      description: 'Transaction successfully created.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "txn_abc123def456",
          type: "payout",
          status: "pending",
          amount: "1000.00",
          currency: "USD",
          customer_id: "cust_abc123",
          payment_method: "bank_transfer",
          recipient: {
            name: "John Doe",
            account_number: "****7890",
            routing_number: "021000021"
          },
          created_at: "2024-12-16T15:30:00Z",
          metadata: {
            reference: "INV-001",
            invoice_id: "inv_xyz789"
          },
          estimated_completion: "2024-12-18T15:30:00Z"
        }
      }, null, 2),
    },
    {
      statusCode: 400,
      label: 'Bad Request',
      description: 'Invalid request parameters.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "validation_error",
          message: "Invalid request parameters",
          details: [
            {
              field: "amount",
              message: "Amount must be greater than 0"
            }
          ]
        }
      }, null, 2),
    },
    {
      statusCode: 402,
      label: 'Payment Required',
      description: 'Insufficient funds to complete transaction.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "insufficient_funds",
          message: "Customer account has insufficient balance for this transaction"
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X POST "https://globalconnectors.loopay.com/v1/transactions" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: key_abc123def456" \\
  -d '{
    "type": "payout",
    "customer_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "amount": "1000.00",
    "currency": "USD",
    "payment_method": "bank_transfer",
    "recipient": {
      "name": "John Doe",
      "account_number": "1234567890",
      "routing_number": "021000021"
    },
    "metadata": {
      "reference": "INV-001"
    }
  }'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/transactions',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json',
      'Idempotency-Key': 'key_abc123def456'
    },
    body: JSON.stringify({
      type: 'payout',
      customer_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
      amount: '1000.00',
      currency: 'USD',
      payment_method: 'bank_transfer',
      recipient: {
        name: 'John Doe',
        account_number: '1234567890',
        routing_number: '021000021'
      },
      metadata: {
        reference: 'INV-001'
      }
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

url = "https://globalconnectors.loopay.com/v1/transactions"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json",
    "Idempotency-Key": "key_abc123def456"
}
payload = {
    "type": "payout",
    "customer_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "amount": "1000.00",
    "currency": "USD",
    "payment_method": "bank_transfer",
    "recipient": {
        "name": "John Doe",
        "account_number": "1234567890",
        "routing_number": "021000021"
    },
    "metadata": {
        "reference": "INV-001"
    }
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)`,
    },
  ];


  return (
    <div className="flex w-full items-start gap-6 lg:gap-8 flex-wrap xl:flex-nowrap">
      {/* Center Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0 px-6 py-6 lg:px-10 max-w-4xl"
      >
        <div className="space-y-6">
          {/* API Header */}
          <ApiHeader
            method="POST"
            endpoint="https://globalconnectors.loopay.com/v1/transactions"
            title="Create Transaction"
            description="Create a new transaction (payin, payout, or transfer). Transactions are processed asynchronously and you can track their status via webhooks or polling."
          />

          <Separator />

          {/* Headers */}
          <ParameterTable
            title="Headers"
            parameters={headerParameters}
          />

          {/* Body Parameters */}
          <ParameterTable
            title="Body Parameters"
            parameters={bodyParameters}
          />

          <Separator />

          {/* Response */}
          <ResponseVisualizer
            title="Response"
            responses={responses}
          />

          {/* Additional Notes */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              📘 Notes
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use <code className="bg-muted px-1 py-0.5 rounded font-mono">Idempotency-Key</code> header to prevent duplicate transactions.</li>
              <li>• Transactions start in <code className="bg-muted px-1 py-0.5 rounded font-mono">pending</code> status and move to <code className="bg-muted px-1 py-0.5 rounded font-mono">processing</code> → <code className="bg-muted px-1 py-0.5 rounded font-mono">completed</code>.</li>
              <li>• Processing time varies by payment method: bank transfers (1-3 days), crypto (minutes).</li>
              <li>• Set up webhooks to receive real-time transaction status updates.</li>
              <li>• All amounts must have exactly 2 decimal places (e.g., "1000.00").</li>
            </ul>
          </div>
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Create transaction"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
