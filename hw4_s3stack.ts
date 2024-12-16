import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';

export class S3Stack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly topic: sns.Topic;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, 'TestBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.topic = new sns.Topic(this, 'S3EventTopic');

    // Trigger SNS topic on S3 events
    this.bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3.Notifications.SnsDestination(this.topic)
    );
  }
}
