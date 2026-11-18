/**
 * API Docs: Get Customer
 * 
 * GET /customers/:id endpoint documentation
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

export default function GetCustomerPage() {
  // Path Parameters
  const pathParameters: Parameter[] = [
    {
      name: 'id',
      type: 'string',
      required: true,
      description: 'Unique identifier of the customer (UUID format).',
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
      description: 'Customer successfully retrieved.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "3c90c3cc-0d44-4b50-8888-8dd25736052a",
          name: "John Doe",
          email: "john@example.com",
          country: "US",
          phone: "+1234567890",
          status: "active",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z",
          metadata: {
            company: "Acme Corp",
            vip: true
          }
        }
      }, null, 2),
    },
    {
      statusCode: 404,
      label: 'Not Found',
      description: 'Customer with the specified ID does not exist.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "resource_not_found",
          message: "Customer not found. Please check the customer ID."
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
      code: `curl -X GET "https://globalconnectors.loopay.com/v1/customers/3c90c3cc-0d44-4b50-8888-8dd25736052a" \\
  -H "Authorization: Bearer sk_live_abc123..."`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const customerId = '3c90c3cc-0d44-4b50-8888-8dd25736052a';

const response = await fetch(
  \`https://globalconnectors.loopay.com/v1/customers/\${customerId}\`,
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

customer_id = '3c90c3cc-0d44-4b50-8888-8dd25736052a'
url = f"https://globalconnectors.loopay.com/v1/customers/{customer_id}"
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
            endpoint="https://globalconnectors.loopay.com/v1/customers/:id"
            title="Get Customer"
            description="Retrieve detailed information about a specific customer using their unique ID. Returns all customer data including metadata and verification status."
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
              <li>• The customer ID must be a valid UUID format.</li>
              <li>• The <code className="bg-muted px-1 py-0.5 rounded font-mono">status</code> field indicates if the customer account is active, inactive, or pending.</li>
              <li>• The <code className="bg-muted px-1 py-0.5 rounded font-mono">metadata</code> object contains custom data set during customer creation or updates.</li>
              <li>• All timestamps are in ISO 8601 format (UTC).</li>
            </ul>
          </div>
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Get customer"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
