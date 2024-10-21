import { s3Client } from '@/clients/s3Client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

interface IGetS3ObjectParams {
  bucket: string;
  key: string;
}

export async function getS3Object({ bucket, key }: IGetS3ObjectParams) {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const { Body } = await s3Client.send(getObjectCommand);

  if (!(Body instanceof Readable))
    throw new Error(`Cannot find file ${bucket}/${key}`);

  const chuncks = [];
  for await (const chunck of Body) {
    chuncks.push(chunck);
  }

  return Buffer.concat(chuncks);
}
