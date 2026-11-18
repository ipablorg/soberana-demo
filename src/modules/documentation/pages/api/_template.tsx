/**
 * API Endpoint Template
 * 
 * Copy this file to create a new API endpoint documentation page.
 * 
 * Steps:
 * 1. Copy this file to the appropriate resource folder (e.g., api/customers/new-endpoint.tsx)
 * 2. Update the method, endpoint, title, and description
 * 3. Define parameters (query, body, headers)
 * 4. Define response examples
 * 5. Create code examples
 * 6. Add route in docs-routes.tsx
 * 7. Update sidebar in ApiDocsLayout.tsx
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

export default function TemplateEndpointPage() {
  // ============================================
  // 1. QUERY PARAMETERS (for GET requests)
  // ============================================
  const queryParameters: Parameter[] = [
    {
      name: 'example_param',
      type: 'string', // string | number | boolean | object | array
      required: false,
      description: 'Description of what this parameter does.',
      defaultValue: 'default_value',
      example: 'example_value',
    },
  ];

  // ============================================
  // 2. BODY PARAMETERS (for POST/PUT/PATCH)
  // ============================================
  const bodyParameters: Parameter[] = [
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'Full name of the resource.',
      example: 'John Doe',
    },
  ];

  // ============================================
  // 3. HEADER PARAMETERS
  // ============================================
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

  // ============================================
  // 4. RESPONSE EXAMPLES
  // ============================================
  const responses: ResponseExample[] = [
    {
      statusCode: 200, // or 201 for POST
      label: 'Success',
      description: 'Request completed successfully.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "resource_abc123",
          name: "Example Resource",
          created_at: "2024-12-16T10:30:00Z"
        }
      }, null, 2),
    },
    {
      statusCode: 400,
      label: 'Bad Request',
      description: 'Invalid request parameters.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "validation_error",
          message: "Invalid parameters provided",
          details: [
            {
              field: "name",
              message: "Name is required"
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

  // ============================================
  // 5. CODE EXAMPLES FOR STICKY RAIL
  // ============================================
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X GET "https://globalconnectors.loopay.com/v1/resource?param=value" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json"`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/resource?param=value',
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json'
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

url = "https://globalconnectors.loopay.com/v1/resource"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json"
}
params = {
    "param": "value"
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(data)`,
    },
  ];


  // ============================================
  // 6. RENDER
  // ============================================
  return (
    <div className="flex">
      {/* Center Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0 px-6 py-10 lg:px-10 max-w-4xl"
      >
        <div className="space-y-10">
          {/* API Header */}
          <ApiHeader
            method="GET" // GET | POST | PUT | PATCH | DELETE
            endpoint="https://globalconnectors.loopay.com/v1/resource"
            title="Endpoint Title"
            description="Detailed description of what this endpoint does, what it returns, and any important notes."
          />

          <Separator />

          {/* Query Parameters (only for GET/DELETE) */}
          {queryParameters.length > 0 && (
            <ParameterTable
              title="Query Parameters"
              parameters={queryParameters}
            />
          )}

          {/* Body Parameters (only for POST/PUT/PATCH) */}
          {bodyParameters.length > 0 && (
            <ParameterTable
              title="Body Parameters"
              parameters={bodyParameters}
            />
          )}

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

          {/* Additional Notes (Optional) */}
          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              📘 Notes
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Important note about rate limiting or caching</li>
              <li>• Behavior details or edge cases</li>
              <li>• Links to related endpoints or resources</li>
            </ul>
          </div>
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
