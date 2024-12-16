import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';

export class MonitoringStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, loggingLambda: logs.LogGroup, cleanerLambda: lambda.Function, props?: cdk.StackProps) {
    super(scope, id, props);

    // Metric filter
    const metricFilter = new logs.MetricFilter(this, 'MetricFilter', {
      logGroup: loggingLambda,
      metricNamespace: 'Assignment4App',
      metricName: 'TotalObjectSize',
      filterPattern: logs.FilterPattern.jsonField('size_delta'),
      metricValue: '$.size_delta',
    });

    // Alarm
    const alarm = new cloudwatch.Alarm(this, 'SizeAlarm', {
      metric: metricFilter.metric(),
      threshold: 20,
      evaluationPeriods: 1,
      statistic: 'Sum',
    });

    alarm.addAlarmAction(new cloudwatch_actions.LambdaFunction(cleanerLambda));
  }
}
