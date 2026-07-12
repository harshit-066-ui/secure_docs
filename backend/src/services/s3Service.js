import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, bucketName } from '../config/s3.js';
import { AppError } from '../utils/AppError.js';

const PRESIGNED_URL_EXPIRY_SECONDS = 3600;

export async function uploadDocument(buffer, s3Key, contentType) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return { s3_key: s3Key };
  } catch (err) {
    throw new AppError(`Failed to upload document to S3: ${err.message}`, 500);
  }
}

export async function downloadDocument(s3Key) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    return await s3Client.send(command);
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      throw new AppError('Document not found in storage', 404);
    }
    throw new AppError(`Failed to download document from S3: ${err.message}`, 500);
  }
}

export async function deleteDocument(s3Key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    await s3Client.send(command);
    return { message: 'Document deleted from S3' };
  } catch (err) {
    throw new AppError(`Failed to delete document from S3: ${err.message}`, 500);
  }
}

export async function generatePresignedDownloadUrl(s3Key, filename) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });

    return {
      url,
      expires_in: PRESIGNED_URL_EXPIRY_SECONDS,
    };
  } catch (err) {
    throw new AppError(`Failed to generate download URL: ${err.message}`, 500);
  }
}

export function buildS3Key(userId, filename) {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${Date.now()}-${sanitizedFilename}`;
}
