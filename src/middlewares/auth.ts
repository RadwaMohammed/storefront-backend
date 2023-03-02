import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // The authorization header sent with the request
    const authorizationHeader = req.headers.authorization;
    // Get the token out of the authorization header
    const token = (authorizationHeader as string).split(' ')[1];
    // Check if the token is valid or not
    jwt.verify(token, process.env.TOKEN_SECRET as Secret);

    next();
  } catch (error) {
    res.status(401);
    res.json('Access denied, invalid. Please sign in');
  }
};

export default verifyAuthToken;
