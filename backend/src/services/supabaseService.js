import { supabaseAdmin, supabaseAnon } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function signUpUser(email, password) {
  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    },
  });

  if (error) {
    throw new AppError(error.message, 400);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function loginUser(email, password) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AppError(error.message, 401);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function logoutUser(accessToken) {
  const { error } = await supabaseAdmin.auth.admin.signOut(
    accessToken,
    'global'
  );

  if (error) {
    throw new AppError(error.message, 400);
  }

  return {
    message: 'Logged out successfully',
  };
}


// ===============================
// PROFILE OPERATIONS
// ===============================

export async function createProfile(userId, username) {

  // Wait until auth user exists
  let userExists = false;
  let attempts = 5;

  while (!userExists && attempts > 0) {

    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (data?.user) {
      userExists = true;
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    attempts--;
  }

  if (!userExists) {
    throw new AppError(
      'Unable to verify authenticated user',
      500
    );
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      username,
    })
    .select()
    .single();

  if (error) {
    console.error('CREATE PROFILE ERROR:', error);
    throw new AppError(error.message, 500);
  }

  return data;
}
export async function getProfileByUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('GET PROFILE ERROR:', error);
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new AppError(error.message, 500);
  }

  return data;
}

export async function checkUsernameExists(username) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('CHECK USERNAME ERROR:', error);
    throw new AppError(error.message, 500);
  }

  return !!data;
}


// ===============================
// DOCUMENT OPERATIONS
// ===============================

export async function getDocumentsByUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select(
      'id, user_id, filename, s3_key, file_size, uploaded_at'
    )
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('FETCH DOCUMENT ERROR:', error);
    throw new AppError(error.message, 500);
  }

  return data;
}


export async function getDocumentById(documentId, userId) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select(
      'id, user_id, filename, s3_key, file_size, uploaded_at'
    )
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('GET DOCUMENT ERROR:', error);
    throw new AppError('Document not found', 404);
  }

  return data;
}


export async function createDocumentMetadata({
  userId,
  filename,
  fileSize,
  s3Key,
}) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert({
      user_id: userId,
      filename,
      file_size: fileSize,
      s3_key: s3Key,
    })
    .select(
      'id, user_id, filename, s3_key, file_size, uploaded_at'
    )
    .single();

  if (error) {
    console.error('CREATE DOCUMENT ERROR:', error);
    throw new AppError(error.message, 500);
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
    console.error('DELETE DOCUMENT ERROR:', error);
    throw new AppError(error.message, 500);
  }

  return {
    message: 'Document deleted successfully',
  };
}