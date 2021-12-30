import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

export async function validateAuthToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.header('authorization');
    if (!authHeader || authHeader.toLowerCase().indexOf('bearer') === -1) {
      return res.status(401).send({
        statusCode: 401,
        message: 'Unauthorized',
        details: 'Missing auth token',
      });
    }
    const token = authHeader.replace(/bearer\s/i, '');
    const claims = await axios.post(`${process.env.BASE_URL}/jwt/introspect`, { token });
    res.locals.claims = claims;  
    next();
  } catch (error) {
    console.error('Error in validateAuthToken:', error);
    res.status(401).send({
      statusCode: 401,
      message: 'Unauthorized',
      details: 'Invalid auth token',
    });
  }
}
