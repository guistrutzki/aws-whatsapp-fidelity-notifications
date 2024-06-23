#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';

import { CustomersAppStack } from 'lib/customersApp-stack';
import { CustomersAppLayersStack } from 'lib/customersAppLayers-stack';
import { FidelityNotificationApiStack } from 'lib/fidelityNotificationApi-stack';

dotenv.config();

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.AWS_ACCOUNT as string,
  region: process.env.AWS_REGION as string,
};

const tags = {
  cost: process.env.COST_CENTER as string,
  team: process.env.TEAM as string,
};

const customersAppLayersStack = new CustomersAppLayersStack(
  app,
  'CustomersAppLayers',
  { env, tags }
);

const customersAppStack = new CustomersAppStack(app, 'CustomersAppStack', {
  env,
  tags,
});

customersAppStack.addDependency(customersAppLayersStack);

const fidelityNotificationApiStack = new FidelityNotificationApiStack(
  app,
  'FidelityNotificationApi',
  {
    customersHandler: customersAppStack.customersHandler,
    env,
    tags,
  }
);

fidelityNotificationApiStack.addDependency(customersAppStack);
