/**
 * API Docs: Get Bank Account
 * 
 * GET /bank-accounts/:id endpoint documentation
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

export default function GetBankAccountPage() {
  // Path Parameters
  const pathParameters: ParameterProperty[] = [
    {
      name: 'accountId',
      type: 'string<uuid>',
      required: true,
      description: 'The unique identifier of the bank account.',
      example: 'acc_1234567890',
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
      description: 'Bank account retrieved successfully.',
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
          verificationStatus: "verified",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z"
        }
      }, null, 2),
    },
    {
      statusCode: 404,
      label: 'Not Found',
      description: 'Bank account not found.',
      body: JSON.stringify({
        success: false,
        error: {
          code: "resource_not_found",
          message: "Bank account with the specified ID was not found"
        }
      }, null, 2),
    },
  ];

  // Code Examples
  const requestExamples: CodeExample[] = [
    {
      language: 'bash',
      label: 'cURL',
      code: `curl -X GET "https://globalconnectors.loopay.com/v1/bank-accounts/acc_1234567890" \\
  -H "Authorization: Bearer sk_live_abc123..."`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const accountId = 'acc_1234567890';

const response = await fetch(
  \`https://globalconnectors.loopay.com/v1/bank-accounts/\${accountId}\`,
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

account_id = "acc_1234567890"
url = f"https://globalconnectors.loopay.com/v1/bank-accounts/{account_id}"
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
            endpoint="https://globalconnectors.loopay.com/v1/bank-accounts/:accountId"
            title="Read Bank Account"
            description="Retrieve details of a specific bank account by its ID."
          />

          <Separator />

          <ParameterList title="Path Parameters" parameters={pathParameters} />
          <ParameterList title="Headers" parameters={headerParameters} />

          <Separator />

          <ResponseVisualizer title="Response" responses={responses} />

          <ApiPagination />
        </div>
      </motion.main>

      <StickyCodeRail
        requestTitle="Read a bank account"
        requestExamples={requestExamples}
        responseExamples={responses}
      />
    </div>
  );
}
