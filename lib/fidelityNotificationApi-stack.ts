import * as cdk from 'aws-cdk-lib';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cwlogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface FidelityNotificationApiStackProps extends cdk.StackProps {
  customersHandler: lambdaNodeJS.NodejsFunction;
}

export class FidelityNotificationApiStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: FidelityNotificationApiStackProps
  ) {
    super(scope, id, props);

    const logGroup = new cwlogs.LogGroup(this, 'FidelityNotificationApiLogs');
    const api = new apigateway.RestApi(this, 'FidelityNotificationApi', {
      restApiName: 'FidelityNotificationApi',
      cloudWatchRole: true,
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true,
        }),
      },
    });

    const customersIntegration = new apigateway.LambdaIntegration(
      props.customersHandler
    );

    // GET /customers
    const customersResource = api.root.addResource('customers');
    customersResource.addMethod('GET', customersIntegration, {});

    // GET /customers/{id}
    const customerIdResource = customersResource.addResource('{id}');
    customerIdResource.addMethod('GET', customersIntegration, {});

    // POST /customers
    customersResource.addMethod('POST', customersIntegration, {});

    // POST /customers/{id}/visits
    const customerVisitsResource = customerIdResource.addResource('visits');
    customerVisitsResource.addMethod('POST', customersIntegration, {});
  }
}
