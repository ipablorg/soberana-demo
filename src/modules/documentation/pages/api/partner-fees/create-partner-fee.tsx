/**
 * API Docs: Create Partner Fee
 * 
 * POST /partner-fees endpoint documentation
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

export default function CreatePartnerFeePage() {
  // Body Parameters
  const bodyParameters: ParameterProperty[] = [
    {
      name: 'partnerId',
      type: 'string<uuid>',
      required: true,
      description: 'The unique identifier of the partner.',
      example: 'partner_xyz789',
    },
    {
      name: 'feeType',
      type: 'enum<string>',
      required: true,
      description: 'Type of fee calculation.',
      enum: ['percentage', 'fixed'],
      example: 'percentage',
    },
    {
      name: 'feeValue',
      type: 'number',
      required: true,
      description: 'Fee value (percentage or fixed amount).',
      example: '1.5',
    },
    {
      name: 'currency',
      type: 'string',
      required: true,
      description: 'Currency code for fixed fees (required if feeType is "fixed").',
      example: 'USD',
    },
    {
      name: 'transactionTypes',
      type: 'array',
      required: true,
      description: 'Transaction types this fee applies to.',
      example: '["on-ramp", "off-ramp"]',
    },
    {
      name: 'minAmount',
      type: 'number',
      required: false,
      description: 'Minimum transaction amount for this fee to apply.',
      example: '10.00',
    },
    {
      name: 'maxAmount',
      type: 'number',
      required: false,
      description: 'Maximum transaction amount for this fee to apply.',
      example: '10000.00',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 201,
      label: 'Created',
      description: 'Partner fee created successfully.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "fee_new123",
          partnerId: "partner_xyz789",
          feeType: "percentage",
          feeValue: 1.5,
          minAmount: 10.00,
          maxAmount: 10000.00,
          currency: "USD",
          transactionTypes: ["on-ramp", "off-ramp"],
          status: "active",
          effectiveFrom: "2024-12-16T00:00:00Z",
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
      code: `curl -X POST "https://globalconnectors.loopay.com/v1/partner-fees" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "partnerId": "partner_xyz789",
    "feeType": "percentage",
    "feeValue": 1.5,
    "currency": "USD",
    "transactionTypes": ["on-ramp", "off-ramp"],
    "minAmount": 10.00,
    "maxAmount": 10000.00
  }'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/partner-fees',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      partnerId: 'partner_xyz789',
      feeType: 'percentage',
      feeValue: 1.5,
      currency: 'USD',
      transactionTypes: ['on-ramp', 'off-ramp'],
      minAmount: 10.00,
      maxAmount: 10000.00
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

url = "https://globalconnectors.loopay.com/v1/partner-fees"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json"
}
payload = {
    "partnerId": "partner_xyz789",
    "feeType": "percentage",
    "feeValue": 1.5,
    "currency": "USD",
    "transactionTypes": ["on-ramp", "off-ramp"],
    "minAmount": 10.00,
    "maxAmount": 10000.00
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
            endpoint="https://globalconnectors.loopay.com/v1/partner-fees"
            title="Create Partner Fee"
            description="Create a new fee configuration for a partner. Fees are applied automatically to matching transactions."
          />

          <Separator />

          <ParameterList title="Body Parameters" parameters={bodyParameters} />

          <Separator />

          <ResponseVisualizer title="Response" responses={responses} />

          <ApiPagination />
        </div>
      </motion.main>

      <StickyCodeRail
        requestTitle="Create a partner fee"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
