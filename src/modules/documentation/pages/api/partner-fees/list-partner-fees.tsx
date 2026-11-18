/**
 * API Docs: List Partner Fees
 * 
 * GET /partner-fees endpoint documentation
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

export default function ListPartnerFeesPage() {
  // Query Parameters
  const queryParameters: ParameterProperty[] = [
    {
      name: 'size',
      type: 'integer',
      required: false,
      description: 'Number of partner fees to return per page.',
      defaultValue: '25',
      example: '25',
    },
    {
      name: 'cursor',
      type: 'string<uuid>',
      required: false,
      description: 'Cursor for pagination.',
      example: 'fee_cursor_abc123',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 200,
      label: 'Success',
      description: 'Partner fees retrieved successfully.',
      body: JSON.stringify({
        success: true,
        data: [
          {
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
            createdAt: "2023-12-15T10:30:00Z"
          }
        ],
        pagination: {
          nextCursor: "fee_cursor_next",
          previousCursor: null,
          hasNext: true,
          hasPrevious: false
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X GET "https://globalconnectors.loopay.com/v1/partner-fees?size=25" \\
  -H "Authorization: Bearer sk_live_abc123..."`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/partner-fees?size=25',
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

url = "https://globalconnectors.loopay.com/v1/partner-fees"
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
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0 px-6 py-6 lg:px-10 max-w-4xl"
      >
        <div className="space-y-6">
          <ApiHeader
            method="GET"
            endpoint="https://globalconnectors.loopay.com/v1/partner-fees"
            title="Read All Partner Fees"
            description="Retrieve a paginated list of all partner fee configurations."
          />

          <Separator />

          <ParameterList title="Query Parameters" parameters={queryParameters} />

          <Separator />

          <ResponseVisualizer title="Response" responses={responses} />

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">📘 Notes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Partner fees can be percentage-based or fixed amounts</li>
              <li>• Fees are applied automatically to qualifying transactions</li>
              <li>• Multiple fee tiers can be active for different amount ranges</li>
            </ul>
          </div>

          <ApiPagination />
        </div>
      </motion.main>

      <StickyCodeRail
        requestTitle="Read all partner fees"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
