import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class S3Stack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "TestBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const sizeTrackingLambda = lambda.Function.fromFunctionArn(
      this,
      "SizeTrackingLambda",
      "<LambdaFunctionArn>"
    );

    // Add event trigger
    this.bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3.Notifications.LambdaDestination(sizeTrackingLambda)
    );
  }
}
