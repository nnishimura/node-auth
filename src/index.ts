import express, { json, Request, Response, Router, urlencoded } from 'express';
import { errors } from 'celebrate';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import cors from 'cors';
import jwtRouer from './routes/jwt';
import usersRouer from './routes/users';

const env = dotenv.config({ path: '.env' });
dotenvExpand(env);

export const app = express();
const router = Router();
const port = process.env.PORT || '8000';

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(router);
app.use(jwtRouer(router));
app.use(usersRouer(router));
app.use(errors());

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    validateEnv();
    return console.log(`Server is listening on ${port}`);
  });
}

router.use('/healthcheck', async (_req: Request, res: Response) => {
  try {
    res.status(200).send({ message: 'Welcome to @demo/users service!' });
  } catch (error) {
    res.status(503).send({ message: 'Error in healthcheck', error });
  }
});


function validateEnv() {
  if (!process.env.CLIENT_ID) {
    throw 'env variable CLIENT_ID is not set. Check .env file';
  }
  if (!process.env.AUTH_JWT_SECRET) {
    throw 'env variable AUTH_JWT_SECRET is not set. Check .env file';
  }
  if (!process.env.AUTH_ALLOWED_CLIENT_IDS) {
    throw 'env variable AUTH_ALLOWED_CLIENT_IDS is not set. Check .env file';
  }
  if (!process.env.AUTH_ISSUER) {
    throw 'env variable AUTH_ISSUER is not set. Check .env file';
  }
  if (!process.env.DATABASE_URL) {
    throw 'env variable DATABASE_URL is not set. Check .env file';
  }
}
