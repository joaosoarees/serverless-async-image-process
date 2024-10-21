import type { S3Event } from 'aws-lambda';

export async function handler(event: S3Event) {
  console.log(JSON.stringify(event, null, 2));
}
