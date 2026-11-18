/**
 * API Docs: Get Transaction
 * 
 * GET /transactions/:id endpoint documentation
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

export default function GetTransactionPage() {
  // Path Parameters
  const pathParameters: Parameter[] = [
    {
      name: 'id',
      type: 'string',
      required: true,
      description: 'Unique identifier of the transaction.',
      example: 'txn_abc123def456',
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
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 200,
      label: 'Success',
      description: 'Transaction successfully retrieved.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "txn_abc123def456",
          type: "payout",
          status: "completed",
          amount: "1000.00",
          currency: "USD",
          customer_id: "cust_abc123",
          payment_method: "bank_transfer",
          recipient: {
            name: "John Doe",
            account_number: "****5678",
            bank_name: "Chase Bank"
          },
          created_at: "2024-12-15T10:30:00Z",
          processing_started_at: "2024-12-15T10:31:00Z",
          completed_at: "2024-12-15T10:35:00Z",
          metadata: {
            reference: "INV-001",
            invoice_id: "inv_xyz789"
          },
          fees: {
            platform_fee: "5.00",
            processing_fee: "2.50",
            total: "7.50"
          }
        }
      }, null, 2),
    },
    {
      statusCode: 404,
      label: 'Not Found',
      description: 'Transaction with the specified ID does not exist.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "resource_not_found",
          message: "Transaction not found"
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X GET "https://globalconnectors.loopay.com/v1/transactions/txn_abc123def456" \\
  -H "Authorization: Bearer sk_live_abc123..."`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const transactionId = 'txn_abc123def456';

const response = await fetch(
  \`https://globalconnectors.loopay.com/v1/transactions/\${transactionId}\`,
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...'
    }
  }
);

const data = await response.json();
console.log(data);`,
    },
    {
      language: 'python',
      label: 'Python',
      code: `import requests

transaction_id = 'txn_abc123def456'
url = f"https://globalconnectors.loopay.com/v1/transactions/{transaction_id}"
headers = {
    "Authorization": "Bearer sk_live_abc123..."
}

response = requests.get(url, headers=headers)
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
            method="GET"
            endpoint="https://globalconnectors.loopay.com/v1/transactions/:id"
            title="Get Transaction"
            description="Retrieve detailed information about a specific transaction including status, amounts, fees, and recipient details."
          />

          <Separator />

          {/* Path Parameters */}
          <ParameterTable
            title="Path Parameters"
            parameters={pathParameters}
          />

          {/* Headers */}
          <ParameterTable
            title="Headers"
            parameters={headerParameters}
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
              <li>• Transaction IDs start with <code className="bg-muted px-1 py-0.5 rounded font-mono">txn_</code> prefix.</li>
              <li>• Completed transactions include <code className="bg-muted px-1 py-0.5 rounded font-mono">completed_at</code> timestamp.</li>
              <li>• Failed transactions include an <code className="bg-muted px-1 py-0.5 rounded font-mono">error</code> object with failure reason.</li>
              <li>• Sensitive recipient information (account numbers) are partially masked for security.</li>
              <li>• All timestamps are in ISO 8601 format (UTC).</li>
            </ul>
          </div>
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Get transaction"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
