/**
 * API Docs: List Transactions
 * 
 * GET /transactions endpoint documentation
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

export default function ListTransactionsPage() {
  // Query Parameters
  const queryParameters: Parameter[] = [
    {
      name: 'page',
      type: 'number',
      required: false,
      description: 'Page number for pagination. Starts at 1.',
      defaultValue: '1',
      example: '1',
    },
    {
      name: 'limit',
      type: 'number',
      required: false,
      description: 'Number of transactions per page. Maximum is 100.',
      defaultValue: '20',
      example: '20',
    },
    {
      name: 'status',
      type: 'string',
      required: false,
      description: 'Filter by transaction status. Values: pending, processing, completed, failed.',
      example: 'completed',
    },
    {
      name: 'type',
      type: 'string',
      required: false,
      description: 'Filter by transaction type. Values: payin, payout, transfer.',
      example: 'payout',
    },
    {
      name: 'customer_id',
      type: 'string',
      required: false,
      description: 'Filter transactions by customer ID.',
      example: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
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
      description: 'Successfully retrieved list of transactions.',
      body: JSON.stringify({
        success: true,
        data: {
          transactions: [
            {
              id: "txn_abc123",
              type: "payout",
              status: "completed",
              amount: "1000.00",
              currency: "USD",
              customer_id: "cust_abc123",
              created_at: "2024-12-15T10:30:00Z",
              completed_at: "2024-12-15T10:35:00Z",
              metadata: {
                reference: "INV-001"
              }
            },
            {
              id: "txn_def456",
              type: "payin",
              status: "completed",
              amount: "500.00",
              currency: "EUR",
              customer_id: "cust_def456",
              created_at: "2024-12-14T14:20:00Z",
              completed_at: "2024-12-14T14:22:00Z",
              metadata: {
                reference: "INV-002"
              }
            }
          ],
          pagination: {
            current_page: 1,
            total_pages: 12,
            total_count: 235,
            per_page: 20
          }
        }
      }, null, 2),
    },
    {
      statusCode: 401,
      label: 'Unauthorized',
      description: 'Invalid or missing authentication token.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "unauthorized",
          message: "Invalid authentication token"
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X GET "https://globalconnectors.loopay.com/v1/transactions?page=1&limit=20&status=completed" \\
  -H "Authorization: Bearer sk_live_abc123..."`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/transactions?page=1&limit=20&status=completed',
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

url = "https://globalconnectors.loopay.com/v1/transactions"
headers = {
    "Authorization": "Bearer sk_live_abc123..."
}
params = {
    "page": 1,
    "limit": 20,
    "status": "completed"
}

response = requests.get(url, headers=headers, params=params)
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
            endpoint="https://globalconnectors.loopay.com/v1/transactions"
            title="List Transactions"
            description="Retrieve a paginated list of all transactions in your account. Filter by status, type, or customer to narrow down results."
          />

          <Separator />

          {/* Query Parameters */}
          <ParameterTable
            title="Query Parameters"
            parameters={queryParameters}
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
              <li>• Results are sorted by <code className="bg-muted px-1 py-0.5 rounded font-mono">created_at</code> in descending order (newest first).</li>
              <li>• Maximum <code className="bg-muted px-1 py-0.5 rounded font-mono">limit</code> is 100 transactions per page.</li>
              <li>• Transaction statuses: <code className="bg-muted px-1 py-0.5 rounded font-mono">pending</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono">processing</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono">completed</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono">failed</code>.</li>
              <li>• All amounts are in the transaction's currency with 2 decimal places.</li>
            </ul>
          </div>
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Read all transactions"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
