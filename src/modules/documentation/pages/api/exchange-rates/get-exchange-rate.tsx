/**
 * API Docs: Get Exchange Rate
 * 
 * POST /exchange-rates endpoint documentation
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

export default function GetExchangeRatePage() {
  // Body Parameters
  const bodyParameters: ParameterProperty[] = [
    {
      name: 'sourceCurrency',
      type: 'string',
      required: true,
      description: 'Source currency code (ISO 4217).',
      example: 'USD',
      enum: ['USD', 'BRL', 'EUR', 'MXN', 'COP', 'ARS', 'CLP'],
    },
    {
      name: 'targetCurrency',
      type: 'string',
      required: true,
      description: 'Target currency code (ISO 4217).',
      example: 'BRL',
      enum: ['USD', 'BRL', 'EUR', 'MXN', 'COP', 'ARS', 'CLP'],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      description: 'Amount to convert in source currency.',
      example: '1000.00',
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
      description: 'Exchange rate successfully retrieved.',
      body: JSON.stringify({
        success: true,
        data: {
          sourceCurrency: "USD",
          targetCurrency: "BRL",
          rate: 4.95,
          amount: 1000.00,
          convertedAmount: 4950.00,
          expiresAt: "2024-12-16T18:00:00Z",
          rateId: "rate_abc123xyz"
        }
      }, null, 2),
    },
    {
      statusCode: 400,
      label: 'Bad Request',
      description: 'Invalid currency pair or amount.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "validation_error",
          message: "Invalid request parameters",
          details: {
            field: "sourceCurrency",
            issue: "Currency not supported"
          }
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
      code: `curl -X POST "https://globalconnectors.loopay.com/v1/exchange-rates" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "sourceCurrency": "USD",
    "targetCurrency": "BRL",
    "amount": 1000.00
  }'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/exchange-rates',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sourceCurrency: 'USD',
      targetCurrency: 'BRL',
      amount: 1000.00
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

url = "https://globalconnectors.loopay.com/v1/exchange-rates"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json"
}
payload = {
    "sourceCurrency": "USD",
    "targetCurrency": "BRL",
    "amount": 1000.00
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
            endpoint="https://globalconnectors.loopay.com/v1/exchange-rates"
            title="Get Exchange Rate"
            description="Retrieve the current exchange rate between two currencies. The rate is valid for 5 minutes."
          />

          <Separator />

          {/* Body Parameters */}
          <ParameterList
            title="Body Parameters"
            parameters={bodyParameters}
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
              📘 Notes
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Exchange rates are updated every 30 seconds.</li>
              <li>• The <code className="bg-muted px-1 py-0.5 rounded font-mono">rateId</code> can be used to execute a conversion at this exact rate.</li>
              <li>• Rates expire after 5 minutes and must be refreshed.</li>
              <li>• All amounts use 2 decimal precision.</li>
            </ul>
          </div>
        </div>
      </motion.main>

      {/* Right Sticky Code Rail */}
      <StickyCodeRail
        requestTitle="Get an exchange rate"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
