import { signUpUser, loginUser, logoutUser } from '../services/supabaseService.js';
import { AppError } from '../utils/AppError.js';

export async function signup(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await signUpUser(email, password);
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
