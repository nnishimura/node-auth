import { Request, Response, Router } from 'express';
import { celebrate } from 'celebrate';
import { signupSchema, loginSchema } from './schema';
import { signup, login, getUsers } from '../services/users';
import { parseErrorResponse } from './errorHandler';
import { validateAuthToken } from './middleware';

export default (router: Router) => {
  router.post('/signup', celebrate(signupSchema), async (req: Request, res: Response) => {
    console.log('Incoming request for POST /signup');
    signup(req.body.user)
      .then((token) => {
        return res.status(200).json({ token });
      })
      .catch((err) => {
        const parsedError = parseErrorResponse(err);
        return res.status(parsedError.statusCode).json({ ...parsedError });
      });
  });

  router.post('/login', celebrate(loginSchema), async (req: Request, res: Response) => {
    console.log('Incoming request for POST /login');
    login(req.body.login.email, req.body.login.password)
      .then((token) => {
        return res.status(200).json({ token });
      })
      .catch((err) => {
        const parsedError = parseErrorResponse(err);
        return res.status(parsedError.statusCode).json(parsedError);
      });
  });

  router.get('/users', validateAuthToken, async (_req: Request, res: Response) => {
    console.log('Incoming request for GET /users');
    getUsers()
      .then((users) => {
        return res.status(200).json({ users });
      })
      .catch((err) => {
        const parsedError = parseErrorResponse(err);
        return res.status(parsedError.statusCode).json({ ...parsedError });
      });
  });

  return router;
};
