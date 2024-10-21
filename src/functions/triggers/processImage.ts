import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { S3Event } from 'aws-lambda';
import sharp from 'sharp';

import { s3Client } from '@/clients/s3Client';
import { extractFileInfo } from '@/utils/extractFileInfo';
import { getS3Object } from '@/utils/getS3Object';
import { getS3ObjectMetadata } from '@/utils/getS3ObjectMetadata';

export async function handler(event: S3Event) {
  console.log(JSON.stringify(event, null, 2));

  await Promise.all(
    event.Records.map(async (record) => {
      const { bucket, object } = record.s3;

      const [file, metadata] = await Promise.all([
        getS3Object({
          bucket: bucket.name,
          key: object.key,
        }),
        getS3ObjectMetadata({
          bucket: bucket.name,
          key: object.key,
        }),
      ]);

      console.log(JSON.stringify(metadata, null, 2));

      const [hdImage, sdImage, placeholderImage] = await Promise.all([
        sharp(file)
          .resize({
            width: 1280,
            height: 720,
            background: '#000',
            fit: 'contain',
          })
          .toFormat('webp', { quality: 80 })
          .toBuffer(),
        sharp(file)
          .resize({
            width: 640,
            height: 360,
            background: '#000',
            fit: 'contain',
          })
          .toFormat('webp', { quality: 80 })
          .toBuffer(),
        sharp(file)
          .resize({
            width: 124,
            height: 70,
            background: '#000',
            fit: 'contain',
          })
          .toFormat('webp', { quality: 80 })
          .blur(5)
          .toBuffer(),
      ]);

      const { fileName } = extractFileInfo(object.key);

      const hdThumbnailKey = `processed/${fileName}_hd.webp`;
      const sdThumbnailKey = `processed/${fileName}_sd.webp`;
      const placeholderThumbnailKey = `processed/${fileName}_placeholder.webp`;

      const hdPutObjectCommand = new PutObjectCommand({
        Bucket: bucket.name,
        Key: hdThumbnailKey,
        Body: hdImage,
      });
      const sdPutObjectCommand = new PutObjectCommand({
        Bucket: bucket.name,
        Key: sdThumbnailKey,
        Body: sdImage,
      });
      const placeholderPutObjectCommand = new PutObjectCommand({
        Bucket: bucket.name,
        Key: placeholderThumbnailKey,
        Body: placeholderImage,
      });

      await Promise.all([
        s3Client.send(hdPutObjectCommand),
        s3Client.send(sdPutObjectCommand),
        s3Client.send(placeholderPutObjectCommand),
      ]);
    }),
  );
}
