import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { CustomerRepository } from '/opt/customersLayer';

const customersDdb = process.env.CUSTOMERS_TABLE_NAME ?? '';
const ddbClient = new DynamoDB.DocumentClient();

const productRepository = new CustomerRepository(ddbClient, customersDdb);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const path = event.resource;
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(
    `API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`
  );

  if (method === 'POST') {
    if (path === '/customers') {
      try {
        const customer = JSON.parse(event.body ?? '');
        const newCustomer = await productRepository.createCustomer(customer);

        return {
          statusCode: 201,
          body: JSON.stringify(newCustomer),
        };
      } catch (err) {
        console.error((<Error>err).message);
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: 'Error creating customer',
          }),
        };
      }
    } else if (path === '/customers/{id}/visits') {
      try {
        const id = event.pathParameters?.id ?? '';
        const updatedCustomer = await productRepository.updateCustomerVisits(
          id
        );

        return {
          statusCode: 200,
          body: JSON.stringify(updatedCustomer),
        };
      } catch (err) {
        console.error((<Error>err).message);
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: 'Error updating customer visits',
          }),
        };
      }
    }
  } else if (method === 'GET') {
    if (path === '/customers') {
      const customers = await productRepository.listCustomers(20, null);

      return {
        statusCode: 200,
        body: JSON.stringify(customers),
      };
    } else if (path === '/customers/{id}') {
      const id = event.pathParameters?.id ?? '';

      const customer = await productRepository.getCustomerById(id);
      return {
        statusCode: 200,
        body: JSON.stringify(customer),
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad request',
    }),
  };
}
