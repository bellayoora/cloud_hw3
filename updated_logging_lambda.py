import boto3
import json
import os
from botocore.exceptions import ClientError

# Initialize AWS services
logs_client = boto3.client('logs')
sqs_client = boto3.client('sqs')

# Environment variables
QUEUE_URL = os.environ['QUEUE_URL']
LOG_GROUP_NAME = os.environ.get('LOG_GROUP_NAME', '/aws/lambda/logging_lambda')

def get_deleted_object_size(object_name):
    """Retrieve the size of the deleted object from CloudWatch logs."""
    try:
        response = logs_client.filter_log_events(
            logGroupName=LOG_GROUP_NAME,
            filterPattern=f'{{ $.object_name = "{object_name}" }}',
            limit=1
        )
        if 'events' in response and len(response['events']) > 0:
            log_event = json.loads(response['events'][0]['message'])
            return log_event.get('size_delta', 0)
    except ClientError as error:
        print(f"Error querying logs: {error}")
    return 0

def lambda_handler(event, context):
    """Process messages from the SQS queue."""
    try:
        # Receive messages from the queue
        response = sqs_client.receive_message(
            QueueUrl=QUEUE_URL,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=5
        )
        
        if 'Messages' not in response:
            print("No messages in the queue")
            return
        
        for message in response['Messages']:
            body = json.loads(message['Body'])
            sns_message = json.loads(body['Message'])
            s3_event = sns_message['Records'][0]
            event_name = s3_event['eventName']
            object_name = s3_event['s3']['object']['key']
            
            if event_name.startswith('ObjectCreated'):
                size_delta = s3_event['s3']['object']['size']
                log_entry = {"object_name": object_name, "size_delta": size_delta}
            elif event_name.startswith('ObjectRemoved'):
                size_delta = -get_deleted_object_size(object_name)
                log_entry = {"object_name": object_name, "size_delta": size_delta}
            else:
                print(f"Unhandled event type: {event_name}")
                continue
            
            # Log the entry
            print(json.dumps(log_entry))
            
            # Delete the processed message from the queue
            sqs_client.delete_message(
                QueueUrl=QUEUE_URL,
                ReceiptHandle=message['ReceiptHandle']
            )
    except ClientError as error:
        print(f"Error processing SQS messages: {error}")
