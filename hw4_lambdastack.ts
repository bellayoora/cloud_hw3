import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, sizeTrackingQueue: sqs.Queue, loggingQueue: sqs.Queue, props?: cdk.StackProps) {
    super(scope, id, props);

    const sizeTrackingLambda = new lambda.Function(this, 'SizeTrackingLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'size_tracking.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'size-tracking')),
      environment: {
        QUEUE_URL: sizeTrackingQueue.queueUrl,
      },
    });
    sizeTrackingQueue.grantConsumeMessages(sizeTrackingLambda);

    const loggingLambda = new lambda.Function(this, 'LoggingLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'logging.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'logging')),
      environment: {
        QUEUE_URL: loggingQueue.queueUrl,
      },
    });
    loggingQueue.grantConsumeMessages(loggingLambda);

    const cleanerLambda = new lambda.Function(this, 'CleanerLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'cleaner.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'cleaner')),
    });
  }
}
