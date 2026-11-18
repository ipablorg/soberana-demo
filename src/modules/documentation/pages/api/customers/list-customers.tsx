/**
 * API Docs: List All Customers
 * 
 * Example API documentation page showcasing the GET /customers endpoint.
 * Demonstrates usage of ApiHeader, ParameterTable, ResponseVisualizer, and StickyCodeRail.
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

export default function ListCustomersPage() {
  // Query Parameters (usando ParameterProperty para soportar acordeones)
  const queryParameters: ParameterProperty[] = [
    {
      name: 'size',
      type: 'integer',
      required: false,
      description: 'Number of customers to return per page. Required range: 1 <= x <= 100',
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

  // Response Examples (formato Lumx 1:1)
  const responses: ResponseExample[] = [
    {
      statusCode: 200,
      label: 'Success',
      description: 'Resources successfully retrieved.',
      body: JSON.stringify({
        data: [
          {
            id: "3c90c3cc-0d44-4b50-8888-8dd25736052a",
            type: "BUSINESS",
            legalName: "Loopay International S.A",
            taxId: "42.887.120/0001-00",
            incorporationDate: "2020-01-01",
            country: "BRA",
            email: "contact@loopay.com",
            walletAddress: "0x1234567890123456789012345678901234567890",
            blockExplorerUrl: "https://polygonscan.com/address/0x1234567890123456789012345678901234567890",
            verification: {
              status: "APPROVED",
              level: "STANDARD",
              link: "https://verify.globalconnectors.loopay.com/v/abc123"
            },
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          }
        ]
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

  // Code Examples (formato Lumx 1:1)
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl --request GET \\
  --url https://globalconnectors.loopay.com/v1/customers \\
  --header 'Authorization: Bearer <token>'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/customers',
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer <token>'
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

url = "https://globalconnectors.loopay.com/v1/customers"
headers = {
    "Authorization": "Bearer <token>"
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
            endpoint="https://globalconnectors.loopay.com/v1/customers"
            title="List All Customers"
            description="Retrieve a paginated list of all customers in your Soberana account. Results can be filtered by status, search term, and sorted by creation date."
          />

          <Separator />

          {/* Authorizations */}
          <ParameterList
            title="Authorizations"
            parameters={headerParameters}
          />

          {/* Query Parameters */}
          <ParameterList
            title="Query Parameters"
            parameters={queryParameters}
          />

          <Separator />

          {/* Response */}
          <ResponseVisualizer
            title="Response"
            responses={responses}
          />

          {/* Response Schema Details */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground font-heading">
              Response Schema
            </h2>
            
            <ParameterList
              title="200 - application/json"
              parameters={[
                {
                  name: 'data',
                  type: 'object[]',
                  required: true,
                  description: 'An array containing all customers.',
                  properties: [
                    {
                      name: 'id',
                      type: 'string<uuid>',
                      required: true,
                      description: "Customer's unique identifier.",
                      example: '"3c90c3cc-0d44-4b50-8888-8dd25736052a"',
                    },
                    {
                      name: 'type',
                      type: 'enum<string>',
                      required: true,
                      description: "Customer's type.",
                      enum: ['BUSINESS'],
                    },
                    {
                      name: 'legalName',
                      type: 'string',
                      required: true,
                      description: "Customer's legal name.",
                      example: '"Loopay S.A"',
                    },
                    {
                      name: 'taxId',
                      type: 'string',
                      required: true,
                      description: "Customer's tax ID.",
                      example: '"42.887.120/0001-00"',
                    },
                    {
                      name: 'country',
                      type: 'string',
                      required: true,
                      description: "Customer's country (ISO 3166-1 alpha-3).",
                      example: '"BRA"',
                    },
                    {
                      name: 'email',
                      type: 'string',
                      required: true,
                      description: "Customer's email.",
                      example: '"[email protected]"',
                    },
                    {
                      name: 'verification',
                      type: 'object',
                      required: true,
                      description: "Customer's verification status.",
                      properties: [
                        {
                          name: 'status',
                          type: 'enum<string>',
                          required: true,
                          description: 'Verification status.',
                          enum: ['NOT_STARTED', 'UNDER_VERIFICATION', 'APPROVED', 'TEMPORARY_REJECTION', 'FINAL_REJECTION'],
                          example: '"NOT_STARTED"',
                        },
                        {
                          name: 'level',
                          type: 'enum<string>',
                          required: true,
                          description: 'Verification level.',
                          enum: ['STANDARD'],
                          example: '"STANDARD"',
                        },
                        {
                          name: 'link',
                          type: 'string',
                          required: false,
                          description: 'Verification link.',
                          example: '"https://verify.globalconnectors.loopay.com/v/abc123"',
                        },
                      ],
                    },
                    {
                      name: 'createdAt',
                      type: 'string<date-time>',
                      required: true,
                      description: 'Creation date and time (UTC).',
                      example: '"2021-01-01T00:00:00Z"',
                    },
                    {
                      name: 'updatedAt',
                      type: 'string<date-time>',
                      required: true,
                      description: 'Last update date and time (UTC).',
                      example: '"2021-01-01T00:00:00Z"',
                    },
                  ],
                },
              ]}
            />
          </div>

          {/* Pagination */}
          <ApiPagination />
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Read all customers"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
