/**
 * API Docs: Get Partner Fee
 * 
 * GET /partner-fees/:id endpoint documentation
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

export default function GetPartnerFeePage() {
  // Path Parameters
  const pathParameters: ParameterProperty[] = [
    {
      name: 'feeId',
      type: 'string<uuid>',
      required: true,
      description: 'The unique identifier of the partner fee.',
      example: 'fee_abc123',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 200,
      label: 'Success',
      description: 'Partner fee retrieved successfully.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "fee_abc123",
          partnerId: "partner_xyz789",
          feeType: "percentage",
          feeValue: 1.5,
          minAmount: 10.00,
          maxAmount: 10000.00,
          currency: "USD",
          transactionTypes: ["on-ramp", "off-ramp"],
          status: "active",
          effectiveFrom: "2024-01-01T00:00:00Z",
          effectiveUntil: null,
          createdAt: "2023-12-15T10:30:00Z",
          updatedAt: "2023-12-15T10:30:00Z"
        }
      }, null, 2),
    },
    {
      statusCode: 404,
      label: 'Not Found',
      description: 'Partner fee not found.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "resource_not_found",
          message: "Partner fee with the specified ID was not found"
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X GET "https://globalconnectors.loopay.com/v1/partner-fees/fee_abc123" \\
  -H "Authorization: Bearer sk_live_abc123..."`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const feeId = 'fee_abc123';

const response = await fetch(
  \`https://globalconnectors.loopay.com/v1/partner-fees/\${feeId}\`,
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

fee_id = "fee_abc123"
url = f"https://globalconnectors.loopay.com/v1/partner-fees/{fee_id}"
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
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0 px-6 py-6 lg:px-10 max-w-4xl"
      >
        <div className="space-y-6">
          <ApiHeader
            method="GET"
            endpoint="https://globalconnectors.loopay.com/v1/partner-fees/:feeId"
            title="Read Partner Fee"
            description="Retrieve details of a specific partner fee configuration by its ID."
          />

          <Separator />

          <ParameterList title="Path Parameters" parameters={pathParameters} />

          <Separator />

          <ResponseVisualizer title="Response" responses={responses} />

          <ApiPagination />
        </div>
      </motion.main>

      <StickyCodeRail
        requestTitle="Read a partner fee"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
