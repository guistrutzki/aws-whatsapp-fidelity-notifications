import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class CustomersAppLayersStack extends cdk.Stack {
  readonly customersLayer: lambda.LayerVersion;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.customersLayer = new lambda.LayerVersion(this, 'CustomersLayer', {
      code: lambda.Code.fromAsset('lambda/layers/customersLayer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'CustomerLayer',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new ssm.StringParameter(this, 'CustomersLayerArn', {
      parameterName: 'CustomersLayerVersionArn',
      stringValue: this.customersLayer.layerVersionArn,
    });
  }
}
