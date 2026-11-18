/**
 * API Docs: Create Bank Account
 * 
 * POST /bank-accounts endpoint documentation
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

export default function CreateBankAccountPage() {
  // Body Parameters
  const bodyParameters: ParameterProperty[] = [
    {
      name: 'customerId',
      type: 'string<uuid>',
      required: true,
      description: 'The unique identifier of the customer who owns this bank account.',
      example: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    },
    {
      name: 'bankName',
      type: 'string',
      required: true,
      description: 'Name of the financial institution.',
      example: 'Banco de Brasil',
    },
    {
      name: 'accountType',
      type: 'enum<string>',
      required: true,
      description: 'Type of bank account.',
      enum: ['checking', 'savings'],
      example: 'checking',
    },
    {
      name: 'accountNumber',
      type: 'string',
      required: true,
      description: 'Bank account number.',
      example: '123456789',
    },
    {
      name: 'routingNumber',
      type: 'string',
      required: false,
      description: 'Bank routing number (required for US accounts).',
      example: '021000021',
    },
    {
      name: 'currency',
      type: 'string',
      required: true,
      description: 'Currency code (ISO 4217).',
      example: 'BRL',
      enum: ['USD', 'BRL', 'EUR', 'MXN', 'COP', 'ARS', 'CLP'],
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
    {
      name: 'Idempotency-Key',
      type: 'string',
      required: false,
      description: 'Unique key to ensure idempotent requests.',
      example: 'unique-key-12345',
    },
  ];

  // Response Examples
  const responses: ResponseExample[] = [
    {
      statusCode: 201,
      label: 'Created',
      description: 'Bank account created successfully.',
      body: JSON.stringify({
        success: true,
        data: {
          id: "acc_1234567890",
          customerId: "3c90c3cc-0d44-4b50-8888-8dd25736052a",
          bankName: "Banco de Brasil",
          accountType: "checking",
          accountNumber: "****6789",
          currency: "BRL",
          status: "active",
          createdAt: "2024-12-16T10:30:00Z"
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
          message: "Invalid request parameters",
          details: {
            field: "accountNumber",
            issue: "Account number is required"
          }
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X POST "https://globalconnectors.loopay.com/v1/bank-accounts" \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "bankName": "Banco de Brasil",
    "accountType": "checking",
    "accountNumber": "123456789",
    "currency": "BRL"
  }'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch(
  'https://globalconnectors.loopay.com/v1/bank-accounts',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerId: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
      bankName: 'Banco de Brasil',
      accountType: 'checking',
      accountNumber: '123456789',
      currency: 'BRL'
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

url = "https://globalconnectors.loopay.com/v1/bank-accounts"
headers = {
    "Authorization": "Bearer sk_live_abc123...",
    "Content-Type": "application/json"
}
payload = {
    "customerId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "bankName": "Banco de Brasil",
    "accountType": "checking",
    "accountNumber": "123456789",
    "currency": "BRL"
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
            endpoint="https://globalconnectors.loopay.com/v1/bank-accounts"
            title="Create Bank Account"
            description="Create a new bank account for a customer to enable fiat withdrawals and deposits."
          />

          <Separator />

          <ParameterList title="Body Parameters" parameters={bodyParameters} />
          <ParameterList title="Headers" parameters={headerParameters} />

          <Separator />

          <ResponseVisualizer title="Response" responses={responses} />

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">📘 Notes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Account numbers are partially masked in responses for security</li>
              <li>• Bank accounts must be verified before being used for transactions</li>
              <li>• Each customer can have multiple bank accounts in different currencies</li>
            </ul>
          </div>

          <ApiPagination />
        </div>
      </motion.main>

      <StickyCodeRail
        requestTitle="Create a bank account"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
