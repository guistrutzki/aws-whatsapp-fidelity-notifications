import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  visits: number;
}

export class CustomerRepository {
  private ddbClient: DocumentClient;
  private customersTableName: string;

  constructor(ddbClient: DocumentClient, customersTableName: string) {
    this.ddbClient = ddbClient;
    this.customersTableName = customersTableName;
  }

  async createCustomer(customer: Customer): Promise<Customer> {
    const newCustomer = {
      ...customer,
      id: uuidv4(),
    };

    const params = {
      TableName: this.customersTableName,
      Item: newCustomer,
    };

    await this.ddbClient.put(params).promise();

    return newCustomer;
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const params = {
      TableName: this.customersTableName,
      Key: {
        id,
      },
    };

    const result = await this.ddbClient.get(params).promise();

    return result.Item as Customer;
  }

  async updateCustomerVisits(id: string): Promise<Customer> {
    const customer = await this.getCustomerById(id);

    if (!customer) {
      throw new Error('Customer not found');
    }

    const params = {
      TableName: this.customersTableName,
      Key: {
        id,
      },
      UpdateExpression: 'SET visits = :visits',
      ExpressionAttributeValues: {
        ':visits': customer.visits + 1,
      },
      ReturnValues: 'ALL_NEW',
    };

    const result = await this.ddbClient.update(params).promise();

    return result.Attributes as Customer;
  }

  async listCustomers(
    limit: number,
    lastEvaluatedKey: number | null
  ): Promise<Customer[]> {
    const params = {
      TableName: this.customersTableName,
      Limit: limit,
      lastEvaluatedKey: lastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(lastEvaluatedKey))
        : null,
    };

    const result = await this.ddbClient.scan(params).promise();

    return result.Items as Customer[];
  }
}
