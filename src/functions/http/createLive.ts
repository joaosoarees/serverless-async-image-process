import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { dynamoClient } from '@/clients/dynamoClient';
import { s3Client } from '@/clients/s3Client';
import { env } from '@/config/env';
import { extractFileInfo } from '@/utils/extractFileInfo';
import { response } from '@/utils/response';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const schema = z.object({
  title: z.string().min(1),
  number: z.number().min(0),
  fileName: z.string().min(0),
});

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const body = JSON.parse(event.body ?? '{}');

  const { success, data, error } = schema.safeParse(body);

  if (!success) {
    return response(400, { error: error.issues });
  }

  const { title, number, fileName } = data;

  const { extension } = extractFileInfo(fileName);
  const thumbnailKey = `${randomUUID()}.${extension}`;

  const liveId = randomUUID();

  const putItemCommand = new PutCommand({
    TableName: env.LIVES_TABLE,
    Item: {
      id: liveId,
      title,
      number,
      thumbnailKey,
    },
  });

  const putObjectCommand = new PutObjectCommand({
    Bucket: env.LIVES_IMAGES_BUCKET,
    Key: thumbnailKey,
  });

  const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
    expiresIn: 600,
  });

  await dynamoClient.send(putItemCommand);

  return response(201, { liveId, uploadUrl });
}
