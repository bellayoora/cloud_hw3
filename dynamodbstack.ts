import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDBStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.table = new dynamodb.Table(this, 'S3ObjectSizeHistoryTable', {
      partitionKey: { name: 'BucketName', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}
