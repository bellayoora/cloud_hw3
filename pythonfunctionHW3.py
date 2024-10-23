import boto3
from botocore.exceptions import ClientError
import time

# Initialize boto3 clients for S3 and DynamoDB
s3_client = boto3.client('s3')
dynamodb_client = boto3.client('dynamodb')
dynamodb_resource = boto3.resource('dynamodb')

# Function to create an S3 bucket
def create_s3_bucket(bucket_name):
    region = boto3.session.Session().region_name
    try:
        if region == 'us-east-1':
            response = s3_client.create_bucket(Bucket=bucket_name)
        else:
            response = s3_client.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={
                    'LocationConstraint': region
                }
            )
        print(f"S3 bucket '{bucket_name}' has been successfully created.")
    except ClientError as error:
        print(f"Failed to create bucket: {error}")

# Function to create a DynamoDB table
def create_dynamodb_table(table_name):
    try:
        table = dynamodb_resource.create_table(
            TableName=table_name,
            KeySchema=[
                {
                    'AttributeName': 'BucketName',
                    'KeyType': 'HASH'  
                },
                {
                    'AttributeName': 'Timestamp',
                    'KeyType': 'RANGE'
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'BucketName',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'Timestamp',
                    'AttributeType': 'N'
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        table.meta.client.get_waiter('table_exists').wait(TableName=table_name)
        print(f"DynamoDB table '{table_name}' has been created successfully.")
    except ClientError as error:
        print(f"Error while creating DynamoDB table: {error}")

# Main function to create both S3 bucket and DynamoDB table
def main():
    bucket_name = 'bellachenassignment3'
    table_name = 'S3_object_size_history'

    create_s3_bucket(bucket_name)
    create_dynamodb_table(table_name)

if __name__ == "__main__":
    main()
