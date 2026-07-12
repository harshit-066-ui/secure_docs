import {
  getDocumentsByUserId,
  uploadDocument,
  deleteDocument,
} from '../services/supabaseService.js';
import { AppError } from '../utils/AppError.js';

export async function listDocuments(req, res, next) {
  try {
    const documents = await getDocumentsByUserId(req.user.id);
    res.json({ data: documents });
  } catch (err) {
    next(err);
  }
}

export async function createDocument(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('No file provided', 400);
    }

    const document = await uploadDocument(req.user.id, req.file);
    res.status(201).json({ data: document });
  } catch (err) {
    next(err);
  }
}

export async function removeDocument(req, res, next) {
  try {
    const result = await deleteDocument(req.params.id, req.user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}
