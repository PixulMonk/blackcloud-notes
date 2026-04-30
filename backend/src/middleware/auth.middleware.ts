import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import { User, IUser } from '../models/user.model';
import asyncHandler from '../utils/asyncHandler';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

export const protectRoute = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;
    if (!token) {
      res.status(401); // Set status before throwing!
      throw new Error('Unauthorized - No Token Provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    req.user = user;
    next();
  },
);
