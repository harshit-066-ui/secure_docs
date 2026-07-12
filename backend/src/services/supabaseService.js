import { supabaseAdmin, supabaseAnon } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

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

export async function getDocumentsByUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id, user_id, filename, s3_key, file_size, uploaded_at')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch documents', 500);
  }

  return data;
}

export async function getDocumentById(documentId, userId) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id, user_id, filename, s3_key, file_size, uploaded_at')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new AppError('Document not found', 404);
  }

  return data;
}

export async function createDocumentMetadata({ userId, filename, fileSize, s3Key }) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert({
      user_id: userId,
      filename,
      file_size: fileSize,
      s3_key: s3Key,
    })
    .select('id, user_id, filename, s3_key, file_size, uploaded_at')
    .single();

  if (error) {
    throw new AppError('Failed to save document metadata', 500);
  }

  return data;
}

export async function deleteDocumentMetadata(documentId, userId) {
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
