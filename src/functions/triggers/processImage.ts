import type { S3Event } from 'aws-lambda';

import { getS3Object } from '@/utils/getS3Object';

export async function handler(event: S3Event) {
  console.log(JSON.stringify(event, null, 2));

  await Promise.all(
    event.Records.map(async (record) => {
      const { bucket, object } = record.s3;

      const file = await getS3Object({
        bucket: bucket.name,
        key: object.key,
      });
    }),
  );
}
