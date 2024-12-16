import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class DriverStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, 'DriverLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'driver.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'driver')),
    });
  }
}
