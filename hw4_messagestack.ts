import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';

export class MessagingStack extends cdk.Stack {
  public readonly sizeTrackingQueue: sqs.Queue;
  public readonly loggingQueue: sqs.Queue;

  constructor(scope: cdk.App, id: string, topic: sns.Topic, props?: cdk.StackProps) {
    super(scope, id, props);

    this.sizeTrackingQueue = new sqs.Queue(this, 'SizeTrackingQueue');
    this.loggingQueue = new sqs.Queue(this, 'LoggingQueue');

    // Subscribe queues to SNS topic
    topic.addSubscription(new subs.SqsSubscription(this.sizeTrackingQueue));
    topic.addSubscription(new subs.SqsSubscription(this.loggingQueue));
  }
}
