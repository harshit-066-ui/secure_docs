import { signUpUser, loginUser, logoutUser, createProfile, getProfileByUserId, checkUsernameExists } from '../services/supabaseService.js';
import { AppError } from '../utils/AppError.js';

export async function signup(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username) {
      throw new AppError('Username is required', 400);
    }
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      throw new AppError('Username cannot be empty', 400);
    }
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Check uniqueness of username
    const usernameExists = await checkUsernameExists(trimmedUsername);
    if (usernameExists) {
      throw new AppError('Username is already taken', 400);
    }

    const result = await signUpUser(email, password);

    if (result.user) {
      await createProfile(result.user.id, trimmedUsername);
      result.user.username = trimmedUsername;
    }

    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await loginUser(email, password);

    if (result.user) {
      const profile = await getProfileByUserId(result.user.id);
      if (profile) {
        result.user.username = profile.username;
      }
    }

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const result = await logoutUser(req.accessToken);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const profile = await getProfileByUserId(req.user.id);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
}
