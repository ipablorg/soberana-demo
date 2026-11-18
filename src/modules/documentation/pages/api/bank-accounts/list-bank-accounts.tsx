/**
 * API Docs: Read All Bank Accounts
 * 
 * GET /bank-accounts endpoint documentation
 */

import { motion } from 'framer-motion';
import { 
  ApiHeader, 
  ParameterList,
  ResponseVisualizer, 
  StickyCodeRail,
  type ParameterProperty,
  type ResponseExample,
  type CodeExample
} from '@/modules/documentation/components/api';
import { Separator } from '@/shared/components/ui/separator';

export default function ListBankAccountsPage() {
  // Query Parameters
  const queryParameters: ParameterProperty[] = [
    {
      name: 'size',
      type: 'integer',
      required: false,
      description: 'Number of bank accounts to return per page.',
      defaultValue: '25',
      example: '25',
    },
    {
      name: 'cursor',
      type: 'string<uuid>',
      required: false,
      description: 'Cursor for pagination. Use the nextCursor or previousCursor from the previous response to get the next or previous page.',
      example: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    },
  ];

  // Header Parameters
  const headerParameters: ParameterProperty[] = [
    {
      name: 'Authorization',
      type: 'string',
      required: true,
      description: 'Bearer authentication header on the format Bearer <API_KEY>.',
      example: 'Bearer sk_live_abc123...',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 200,
      label: 'Success',
      description: 'Resources successfully retrieved.',
      body: JSON.stringify({
        data: [
          {
            id: "acc_1234567890",
            customerId: "cust_abc123",
            bankName: "Banco de Brasil",
            accountType: "checking",
            accountNumber: "****5678",
            currency: "BRL",
            status: "active",
            createdAt: "2024-01-15T10:30:00Z"
          },
          {
            id: "acc_0987654321",
            customerId: "cust_abc123",
            bankName: "Itaú Unibanco",
            accountType: "savings",
            accountNumber: "****1234",
            currency: "BRL",
            status: "active",
            createdAt: "2024-02-20T14:45:00Z"
          }
        ],
        pagination: {
          nextCursor: "next_cursor_here",
          previousCursor: null,
          hasNext: true,
          hasPrevious: false
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
          message: "Invalid authentication token. Please check your API key."
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X GET "https://globalconnectors.loopay.com/v1/bank-accounts?size=25" \\
  -H "Authorization: Bearer sk_live_abc123..."`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/bank-accounts?size=25',
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

url = "https://globalconnectors.loopay.com/v1/bank-accounts"
headers = {
    "Authorization": "Bearer sk_live_abc123..."
}
params = {
    "size": 25
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
            endpoint="https://globalconnectors.loopay.com/v1/bank-accounts"
            title="Read All Bank Accounts"
            description="Retrieve a paginated list of all bank accounts associated with your customers."
          />

          <Separator />

          {/* Query Parameters */}
          <ParameterList
            title="Query Parameters"
            parameters={queryParameters}
          />

          {/* Headers */}
          <ParameterList
            title="Headers"
            parameters={headerParameters}
          />

          <Separator />

          {/* Response */}
          <ResponseVisualizer
            title="Response"
            responses={responses}
          />
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Read all bank accounts"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
