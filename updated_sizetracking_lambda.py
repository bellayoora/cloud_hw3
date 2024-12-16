import boto3
import json
import os
from botocore.exceptions import ClientError

# Initialize AWS services
s3_client = boto3.client('s3')
dynamodb_resource = boto3.resource('dynamodb')
sqs_client = boto3.client('sqs')

# Environment variables
QUEUE_URL = os.environ['QUEUE_URL']
TABLE_NAME = os.environ['TABLE_NAME']

def get_total_bucket_size(bucket_name):
    """Calculate the total size of all objects in the bucket."""
    total_size = 0
    total_objects = 0
    paginator = s3_client.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket_name):
        if 'Contents' in page:
            for obj in page['Contents']:
                total_size += obj['Size']
                total_objects += 1
    return total_size, total_objects

def lambda_handler(event, context):
    """Process messages from the SQS queue."""
    table = dynamodb_resource.Table(TABLE_NAME)
    
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
            
            # Parse S3 bucket and object details from the message
            bucket_name = sns_message['Records'][0]['s3']['bucket']['name']
            
            # Get total size and object count
            total_size, total_objects = get_total_bucket_size(bucket_name)
            
            # Write to DynamoDB
            table.put_item(
                Item={
                    'BucketName': bucket_name,
                    'Timestamp': int(context.aws_request_id[:13]),  # Timestamp in milliseconds
                    'TotalSize': total_size,
                    'TotalObjects': total_objects
                }
            )
            
            print(f"Updated size info for bucket: {bucket_name}")
            
            # Delete the processed message from the queue
            sqs_client.delete_message(
                QueueUrl=QUEUE_URL,
                ReceiptHandle=message['ReceiptHandle']
            )
    except ClientError as error:
        print(f"Error processing SQS messages: {error}")
