/**
 * API Docs: Update Customer
 * 
 * PUT /customers/:id endpoint documentation
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

export default function UpdateCustomerPage() {
  // Path Parameters
  const pathParameters: Parameter[] = [
    {
      name: 'id',
      type: 'string',
      required: true,
      description: 'Unique identifier of the customer to update (UUID format).',
      example: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    },
  ];

  // Body Parameters
  const bodyParameters: Parameter[] = [
    {
      name: 'name',
      type: 'string',
      required: false,
      description: 'Updated full name of the customer.',
      example: 'Jane Smith',
    },
    {
      name: 'email',
      type: 'string',
      required: false,
      description: 'Updated email address. Must be unique if changed.',
      example: 'jane.smith@example.com',
    },
    {
      name: 'phone',
      type: 'string',
      required: false,
      description: 'Updated phone number with country code.',
      example: '+1987654321',
    },
    {
      name: 'metadata',
      type: 'object',
      required: false,
      description: 'Updated custom metadata. This will merge with existing metadata.',
      example: '{"department": "Sales", "vip": true}',
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
      statusCode: 200,
      label: 'Success',
      description: 'Customer successfully updated.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "3c90c3cc-0d44-4b50-8888-8dd25736052a",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          country: "US",
          phone: "+1987654321",
          status: "active",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-12-16T14:20:00Z",
          metadata: {
            company: "Acme Corp",
            department: "Sales",
            vip: true
          }
        }
      }, null, 2),
    },
    {
      statusCode: 400,
      label: 'Bad Request',
      description: 'Invalid request body or validation error.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "validation_error",
          message: "Invalid request parameters",
          details: [
            {
              field: "email",
              message: "Email is already in use by another customer"
            }
          ]
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
          message: "Customer not found"
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X PUT "https://globalconnectors.loopay.com/v1/customers/3c90c3cc-0d44-4b50-8888-8dd25736052a" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1987654321",
    "metadata": {
      "department": "Sales",
      "vip": true
    }
  }'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const customerId = '3c90c3cc-0d44-4b50-8888-8dd25736052a';

const response = await fetch(
  \`https://globalconnectors.loopay.com/v1/customers/\${customerId}\`,
  {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1987654321',
      metadata: {
        department: 'Sales',
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

customer_id = '3c90c3cc-0d44-4b50-8888-8dd25736052a'
url = f"https://globalconnectors.loopay.com/v1/customers/{customer_id}"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json"
}
payload = {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1987654321",
    "metadata": {
        "department": "Sales",
        "vip": True
    }
}

response = requests.put(url, headers=headers, json=payload)
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
            method="PUT"
            endpoint="https://globalconnectors.loopay.com/v1/customers/:id"
            title="Update Customer"
            description="Update an existing customer's information. You can update one or multiple fields. Only the fields provided in the request body will be updated."
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
              <li>• Only include fields you want to update. Omitted fields will remain unchanged.</li>
              <li>• The <code className="bg-muted px-1 py-0.5 rounded font-mono">email</code> must be unique if you're changing it.</li>
              <li>• Metadata updates are merged with existing metadata (not replaced completely).</li>
              <li>• The <code className="bg-muted px-1 py-0.5 rounded font-mono">country</code> field cannot be changed after customer creation.</li>
              <li>• The <code className="bg-muted px-1 py-0.5 rounded font-mono">updated_at</code> timestamp is automatically updated.</li>
            </ul>
          </div>
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Update customer"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
