import { supabaseAdmin, supabaseAnon } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

const BUCKET_NAME = 'documents';

export async function signUpUser(email, password) {
  const { data, error } = await supabaseAnon.auth.signUp({ email, password });

  if (error) {
    throw new AppError(error.message, 400);
  }

  if (data.user) {
    await ensureUserProfile(data.user);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function loginUser(email, password) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

  if (error) {
    throw new AppError(error.message, 401);
  }

  if (data.user) {
    await ensureUserProfile(data.user);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function logoutUser(accessToken) {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken, 'global');

  if (error) {
    throw new AppError(error.message, 400);
  }

  return { message: 'Logged out successfully' };
}

export async function ensureUserProfile(user) {
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
    })
    .select('id, email, created_at')
    .single();

  if (error) {
    throw new AppError('Failed to create user profile', 500);
  }

  return data;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, created_at')
    .eq('id', userId)
    .single();

  if (error) {
    throw new AppError('User profile not found', 404);
  }

  return data;
}

export async function getDocumentsByUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id, user_id, filename, file_size, storage_path, uploaded_at')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch documents', 500);
  }

  const documentsWithUrls = await Promise.all(
    data.map(async (document) => {
      const { data: signedUrl, error: urlError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .createSignedUrl(document.storage_path, 3600);

      if (urlError) {
        return { ...document, download_url: null };
      }

      return { ...document, download_url: signedUrl.signedUrl };
    })
  );

  return documentsWithUrls;
}

export async function getDocumentById(documentId, userId) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id, user_id, filename, file_size, storage_path, uploaded_at')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new AppError('Document not found', 404);
  }

  return data;
}

export async function uploadDocument(userId, file) {
  const storagePath = `${userId}/${Date.now()}-${file.originalname}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new AppError(`Upload failed: ${uploadError.message}`, 500);
  }

  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert({
      user_id: userId,
      filename: file.originalname,
      file_size: file.size,
      storage_path: storagePath,
    })
    .select('id, user_id, filename, file_size, storage_path, uploaded_at')
    .single();

  if (error) {
    await supabaseAdmin.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new AppError('Failed to save document metadata', 500);
  }

  const { data: signedUrl } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 3600);

  return {
    ...data,
    download_url: signedUrl?.signedUrl ?? null,
  };
}

export async function deleteDocument(documentId, userId) {
  const document = await getDocumentById(documentId, userId);

  const { error: storageError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([document.storage_path]);

  if (storageError) {
    throw new AppError('Failed to delete file from storage', 500);
  }

  const { error } = await supabaseAdmin
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', userId);

  if (error) {
    throw new AppError('Failed to delete document record', 500);
  }

  return { message: 'Document deleted successfully' };
}
