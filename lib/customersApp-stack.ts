import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CustomersAppStack extends cdk.Stack {
  readonly customersHandler: lambdaNodeJS.NodejsFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.customersHandler = new lambdaNodeJS.NodejsFunction(
      this,
      'CustomersHandler',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 512,
        functionName: 'CustomersFunction',
        entry: 'lambda/customersFunction.ts',
        handler: 'handler',
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          CUSTOMERS_TABLE_NAME: 'customers',
        },
      }
    );
  }
}
