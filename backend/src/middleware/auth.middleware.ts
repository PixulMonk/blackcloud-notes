import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/user.model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error('JWT secret is not provided in environment variables');
  }

  try {
    const token = req.cookies.jwt;

    if (!token) {
      throw new Error('Unauthorized - No Token Provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded) {
      throw new Error('Unauthorized - Invalid Token');
    }
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in protectRoute middleware: ', error.message);
      throw new Error('Internal server error');
    } else {
      console.error('Unkown error in protectRoute middleware');
      throw new Error('Internal server error');
    }
  }
};
