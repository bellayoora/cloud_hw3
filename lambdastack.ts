import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class LambdaStack extends cdk.Stack {
  public readonly driverLambda: lambda.Function;
  public readonly sizeTrackingLambda: lambda.Function;
  public readonly plottingLambda: lambda.Function;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.sizeTrackingLambda = new lambda.Function(this, 'SizeTrackingLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'handler.main',
      code: lambda.Code.fromAsset(path.join(__dirname, 'size-tracking-lambda')),
    });

    this.plottingLambda = new lambda.Function(this, 'PlottingLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'handler.main',
      code: lambda.Code.fromAsset(path.join(__dirname, 'plotting-lambda')),
    });

    this.driverLambda = new lambda.Function(this, 'DriverLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'handler.main',
      code: lambda.Code.fromAsset(path.join(__dirname, 'driver-lambda')),
    });
  }
}
