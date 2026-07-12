import {
  getDocumentsByUserId,
  getDocumentById,
  createDocumentMetadata,
  deleteDocumentMetadata,
} from '../services/supabaseService.js';
import {
  uploadDocument as uploadToS3,
  deleteDocument as deleteFromS3,
  generatePresignedDownloadUrl,
  buildS3Key,
} from '../services/s3Service.js';
import { AppError } from '../utils/AppError.js';

export async function listDocuments(req, res, next) {
  try {
    const documents = await getDocumentsByUserId(req.user.id);
    res.json({ data: documents });
  } catch (err) {
    next(err);
  }
}

export async function uploadDocument(req, res, next) {
  let s3Key = null;

  try {
    const file = req.file;
    s3Key = buildS3Key(req.user.id, file.originalname);

    await uploadToS3(file.buffer, s3Key, file.mimetype);

    const document = await createDocumentMetadata({
      userId: req.user.id,
      filename: file.originalname,
      fileSize: file.size,
      s3Key,
    });

    res.status(201).json({ data: document });
  } catch (err) {
    if (s3Key) {
      try {
        await deleteFromS3(s3Key);
      } catch {
        // Metadata save failed after S3 upload; best-effort cleanup
      }
    }
    next(err);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const document = await getDocumentById(req.params.id, req.user.id);
    const download = await generatePresignedDownloadUrl(document.s3_key, document.filename);

    res.json({
      data: {
        url: download.url,
        filename: document.filename,
        expires_in: download.expires_in,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function removeDocument(req, res, next) {
  try {
    const document = await getDocumentById(req.params.id, req.user.id);

    await deleteFromS3(document.s3_key);
    const result = await deleteDocumentMetadata(req.params.id, req.user.id);

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}
