/**
 * API Docs: Read Customer Verification
 * 
 * GET /customers/:id/verification endpoint documentation
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

export default function CustomerVerificationPage() {
  // Path Parameters
  const pathParameters: ParameterProperty[] = [
    {
      name: 'customerId',
      type: 'string<uuid>',
      required: true,
      description: 'The unique identifier of the customer.',
      example: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
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
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 200,
      label: 'Success',
      description: 'Verification status successfully retrieved.',
      body: JSON.stringify({
        success: true,
        data: {
          customerId: "3c90c3cc-0d44-4b50-8888-8dd25736052a",
          status: "APPROVED",
          level: "STANDARD",
          verificationLink: "https://verify.globalconnectors.loopay.com/v/abc123",
          submittedAt: "2024-01-15T10:30:00Z",
          reviewedAt: "2024-01-16T14:20:00Z",
          expiresAt: "2025-01-15T10:30:00Z",
          documents: [
            {
              type: "passport",
              status: "approved",
              uploadedAt: "2024-01-15T10:32:00Z"
            },
            {
              type: "proof_of_address",
              status: "approved",
              uploadedAt: "2024-01-15T10:35:00Z"
            }
          ]
        }
      }, null, 2),
    },
    {
      statusCode: 404,
      label: 'Not Found',
      description: 'Customer not found.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "resource_not_found",
          message: "Customer with the specified ID was not found"
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
      code: `curl -X GET "https://globalconnectors.loopay.com/v1/customers/3c90c3cc-0d44-4b50-8888-8dd25736052a/verification" \\
  -H "Authorization: Bearer sk_live_abc123..."`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const customerId = '3c90c3cc-0d44-4b50-8888-8dd25736052a';

const response = await fetch(
  \`https://globalconnectors.loopay.com/v1/customers/\${customerId}/verification\`,
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

customer_id = "3c90c3cc-0d44-4b50-8888-8dd25736052a"
url = f"https://globalconnectors.loopay.com/v1/customers/{customer_id}/verification"
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
            endpoint="https://globalconnectors.loopay.com/v1/customers/:customerId/verification"
            title="Read Customer Verification"
            description="Retrieve the verification status and details for a specific customer, including submitted documents and review status."
          />

          <Separator />

          {/* Path Parameters */}
          <ParameterList
            title="Path Parameters"
            parameters={pathParameters}
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

          {/* Additional Notes */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              📘 Verification Statuses
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <code className="bg-muted px-1 py-0.5 rounded font-mono">NOT_STARTED</code> - Customer has not begun verification</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded font-mono">UNDER_VERIFICATION</code> - Documents submitted, under review</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded font-mono">APPROVED</code> - Verification completed successfully</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded font-mono">TEMPORARY_REJECTION</code> - Additional information required</li>
              <li>• <code className="bg-muted px-1 py-0.5 rounded font-mono">FINAL_REJECTION</code> - Verification permanently rejected</li>
            </ul>
          </div>

          {/* Pagination */}
          <ApiPagination />
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Read a verification"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
