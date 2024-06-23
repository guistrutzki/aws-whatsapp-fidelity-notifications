import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CustomersAppStack extends cdk.Stack {
  readonly fidelityNotificationHandler: lambdaNodeJS.NodejsFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.fidelityNotificationHandler = new lambdaNodeJS.NodejsFunction(
      this,
      'FidelityNotificationHandler',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 512,
        functionName: 'FidelityNotificationFunction',
        entry: 'lambda/fidelityNotificationFunction.ts',
        handler: 'handler',
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          TABLE_NAME: 'FidelityNotifications',
        },
      }
    );
  }
}
