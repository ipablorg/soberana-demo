/**
 * API Docs: Create Customer
 * 
 * Example POST endpoint documentation
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

export default function CreateCustomerPage() {
  // Body Parameters
  const bodyParameters: Parameter[] = [
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'Full name of the customer.',
      example: 'John Doe',
    },
    {
      name: 'email',
      type: 'string',
      required: true,
      description: 'Email address of the customer. Must be unique.',
      example: 'john@example.com',
    },
    {
      name: 'country',
      type: 'string',
      required: true,
      description: 'ISO 3166-1 alpha-2 country code.',
      example: 'US',
    },
    {
      name: 'phone',
      type: 'string',
      required: false,
      description: 'Phone number with country code.',
      example: '+1234567890',
    },
    {
      name: 'metadata',
      type: 'object',
      required: false,
      description: 'Custom metadata as key-value pairs. Maximum 20 keys.',
      example: '{"company": "Acme Corp", "vip": true}',
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
    {
      name: 'Content-Type',
      type: 'string',
      required: true,
      description: 'Must be application/json.',
      defaultValue: 'application/json',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 201,
      label: 'Created',
      description: 'Customer successfully created.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "cust_abc123",
          name: "John Doe",
          email: "john@example.com",
          country: "US",
          phone: "+1234567890",
          status: "active",
          created_at: "2024-12-16T10:30:00Z",
          metadata: {
            company: "Acme Corp",
            vip: true
          }
        }
      }, null, 2),
    },
    {
      statusCode: 400,
      label: 'Bad Request',
      description: 'Invalid request body or missing required fields.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "validation_error",
          message: "Invalid request parameters",
          details: [
            {
              field: "email",
              message: "Email is already in use"
            }
          ]
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

  // Code Examples for Sticky Rail
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X POST "https://globalconnectors.loopay.com/v1/customers" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "country": "US",
    "phone": "+1234567890",
    "metadata": {
      "company": "Acme Corp",
      "vip": true
    }
  }'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/customers',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      country: 'US',
      phone: '+1234567890',
      metadata: {
        company: 'Acme Corp',
        vip: true
      }
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

url = "https://globalconnectors.loopay.com/v1/customers"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json"
}
payload = {
    "name": "John Doe",
    "email": "john@example.com",
    "country": "US",
    "phone": "+1234567890",
    "metadata": {
        "company": "Acme Corp",
        "vip": True
    }
}

response = requests.post(url, headers=headers, json=payload)
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
            method="POST"
            endpoint="https://globalconnectors.loopay.com/v1/customers"
            title="Create Customer"
            description="Create a new customer in your Soberana account. The customer will be assigned a unique ID and can be used for transactions immediately."
          />

          <Separator />

          {/* Headers */}
          <ParameterTable
            title="Headers"
            parameters={headerParameters}
          />

          {/* Body Parameters */}
          <ParameterTable
            title="Body Parameters"
            parameters={bodyParameters}
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
              <li>• The <code className="bg-muted px-1 py-0.5 rounded font-mono">email</code> must be unique across your account.</li>
              <li>• Country code must be a valid ISO 3166-1 alpha-2 code (US, MX, BR, etc.).</li>
              <li>• Metadata can contain up to 20 key-value pairs, with each key max 40 characters and value max 500 characters.</li>
              <li>• New customers are automatically set to <code className="bg-muted px-1 py-0.5 rounded font-mono">active</code> status.</li>
            </ul>
          </div>
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Create a customer"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
