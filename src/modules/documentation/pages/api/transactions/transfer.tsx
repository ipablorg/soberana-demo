/**
 * API Docs: Transfer Transaction
 * 
 * POST /transactions/transfer endpoint documentation
 * Transfer cryptocurrency between wallets
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

export default function TransferTransactionPage() {
  // Body Parameters
  const bodyParameters: ParameterProperty[] = [
    {
      name: 'customerId',
      type: 'string<uuid>',
      required: true,
      description: 'The unique identifier of the customer initiating the transfer.',
      example: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    },
    {
      name: 'currency',
      type: 'string',
      required: true,
      description: 'Cryptocurrency ticker symbol to transfer.',
      example: 'USDT',
      enum: ['USDT', 'USDC', 'BTC', 'ETH'],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      description: 'Amount of cryptocurrency to transfer.',
      example: '500.00',
    },
    {
      name: 'sourceWalletAddress',
      type: 'string',
      required: true,
      description: 'Source wallet address to debit from.',
      example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    },
    {
      name: 'destinationWalletAddress',
      type: 'string',
      required: true,
      description: 'Destination wallet address to credit to.',
      example: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    },
    {
      name: 'network',
      type: 'enum<string>',
      required: false,
      description: 'Blockchain network to use for the transfer.',
      enum: ['ethereum', 'polygon', 'binance-smart-chain'],
      defaultValue: 'polygon',
      example: 'polygon',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 201,
      label: 'Created',
      description: 'Transfer transaction created successfully.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "txn_transfer_def456",
          type: "transfer",
          customerId: "3c90c3cc-0d44-4b50-8888-8dd25736052a",
          currency: "USDT",
          amount: 500.00,
          networkFee: 0.50,
          sourceWalletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          destinationWalletAddress: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
          network: "polygon",
          status: "pending",
          txHash: null,
          blockExplorerUrl: null,
          estimatedCompletionTime: "2024-12-16T10:35:00Z",
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
      code: `curl -X POST "https://globalconnectors.loopay.com/v1/transactions/transfer" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: unique-key-11111" \\
  -d '{
    "customerId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "currency": "USDT",
    "amount": 500.00,
    "sourceWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "destinationWalletAddress": "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    "network": "polygon"
  }'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/transactions/transfer',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID()
    },
    body: JSON.stringify({
      customerId: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
      currency: 'USDT',
      amount: 500.00,
      sourceWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      destinationWalletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      network: 'polygon'
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

url = "https://globalconnectors.loopay.com/v1/transactions/transfer"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json",
    "Idempotency-Key": str(uuid.uuid4())
}
payload = {
    "customerId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "currency": "USDT",
    "amount": 500.00,
    "sourceWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "destinationWalletAddress": "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    "network": "polygon"
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
            endpoint="https://globalconnectors.loopay.com/v1/transactions/transfer"
            title="Transfer Transaction"
            description="Transfer cryptocurrency between two wallet addresses on supported blockchain networks."
          />

          <Separator />

          <ParameterList title="Body Parameters" parameters={bodyParameters} />

          <Separator />

          <ResponseVisualizer title="Response" responses={responses} />

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">📘 Notes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Transfer transactions typically confirm within 30 seconds on Polygon</li>
              <li>• Network fees vary by blockchain (Polygon: ~$0.01, Ethereum: ~$5-50)</li>
              <li>• Source wallet must have sufficient balance for amount + network fees</li>
              <li>• Transaction hash becomes available once broadcast to the network</li>
            </ul>
          </div>

          <ApiPagination />
        </div>
      </motion.main>

      <StickyCodeRail
        requestTitle="Transfer"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
