import * as cdk from 'aws-cdk-lib';

export class MainStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Stack = new S3Stack(this, 'S3Stack');
    const dynamoDBStack = new DynamoDBStack(this, 'DynamoDBStack');
    const lambdaStack = new LambdaStack(this, 'LambdaStack');
    new APIGatewayStack(this, 'APIGatewayStack', lambdaStack.plottingLambda);

    // Pass bucket and table to Lambdas
    lambdaStack.sizeTrackingLambda.addEnvironment('BUCKET_NAME', s3Stack.bucket.bucketName);
    lambdaStack.sizeTrackingLambda.addEnvironment('TABLE_NAME', dynamoDBStack.table.tableName);

    s3Stack.bucket.grantReadWrite(lambdaStack.sizeTrackingLambda);
    dynamoDBStack.table.grantReadWriteData(lambdaStack.sizeTrackingLambda);
  }
}
