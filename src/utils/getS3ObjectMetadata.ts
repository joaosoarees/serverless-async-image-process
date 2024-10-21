import { s3Client } from '@/clients/s3Client';
import { HeadObjectCommand } from '@aws-sdk/client-s3';

interface IGetS3ObjectMetadata {
  bucket: string;
  key: string;
}

export async function getS3ObjectMetadata({
  bucket,
  key,
}: IGetS3ObjectMetadata) {
  const headObjectCommand = new HeadObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const { Metadata } = await s3Client.send(headObjectCommand);

  return Metadata ?? {};
}
