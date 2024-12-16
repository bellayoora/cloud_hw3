import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class APIGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, plottingLambda: lambda.IFunction, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.LambdaRestApi(this, 'PlottingAPI', {
      handler: plottingLambda,
      proxy: false,
    });

    const resource = api.root.addResource('plot');
    resource.addMethod('GET'); // Expose a GET method
  }
}
