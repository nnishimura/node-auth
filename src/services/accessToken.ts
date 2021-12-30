import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { getUserById } from "../models/users";
import {
  createAccessToken,
  getAccessTokenById,
  markAccessTokenAsInactive,
} from "../models/accessToken";
import { InvalidToken } from "../routes/errorHandler";

const TOKEN_EXPIRES_IN = process.env.JWT_TOKEN_EXPIRATION
  ? parseInt(process.env.JWT_TOKEN_EXPIRATION, 10)
  : 60 * 60 * 60;
const secret = process.env.AUTH_JWT_SECRET as string;

interface ClaimPayload {
  user_id: string;
  [name: string]: string | void;
}

export async function createToken(
  claimPayload: ClaimPayload,
  signOptions: SignOptions = {}
) {
  const clientId = process.env.CLIENT_ID as string;
  const secret = process.env.AUTH_JWT_SECRET as string;
  const { id } = await createAccessToken(claimPayload.user_id);

  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      {
        iss: process.env.AUTH_ISSUER,
        client_id: clientId,
        aud: clientId,
        jti: id,
        ...claimPayload
      },
      secret,
      { expiresIn: TOKEN_EXPIRES_IN, ...signOptions },
      function (err, token) {
        if (err) {
          return reject(err);
        }
        if (!token) {
          return reject(new Error("token is empty"));
        }
        resolve(token);
      }
    );
  });
}

/**
 * Issue new token or refresh token
 * @param payload Object optional claim payload
 * @param rt? refresh token
 * @returns Promise<string>
 */
export async function issueToken(userId: string, rt?: string) {
  if (rt) {
    return await refreshToken(rt);
  } else {
    return await createToken({ user_id: userId });
  }
}

// TODO:
export async function refreshToken(refreshToken: string) {
  const payload = await introspectToken(refreshToken);
  if (!payload.jti) {
    throw new InvalidToken("Invalid refreshToken. jti is empty");
  }
  try {
    const [token, user] = await Promise.all([
      getAccessTokenById(payload.jti),
      getUserById(payload.user_id),
    ]);
    if (!token || !user) {
      throw new InvalidToken("user or token record does not exist");
    }
    await markAccessTokenAsInactive(token.id);
  } catch (error) {
    throw error;
  }

  delete payload.iat;
  delete payload.exp;
  delete payload.nbf;
  delete payload.jti;

  // fetch token by id
  return await createToken({ user_id: payload.user_id });
}

/**
 * Token introspection
 * @see https://datatracker.ietf.org/doc/html/rfc7662.html
 * @param token string
 * @returns Promise<IntrospectResponse>
 */
export async function introspectToken(token: string) {
  return new Promise<JwtPayload>((resolve, reject) => {
    // this validates if token is valid jwt token & expiration time
    jwt.verify(
      token,
      secret,
      { maxAge: TOKEN_EXPIRES_IN },
      function (err, claims) {
        console.log('claims:', claims);
        if (err) {
          return reject(new Error("failed to verify token:" + err.message));
        }
        if (!claims) {
          return reject(new InvalidToken("Invalid token. claim is empty"));
        }
        const allowedClientIds = (
          process.env.AUTH_ALLOWED_CLIENT_IDS || ""
        ).split(",");
        if (!allowedClientIds.includes(claims.client_id)) {
          return reject(
            new InvalidToken("Invalid token. clientId is not allowed")
          );
        }
        if (!claims.iss || claims.iss !== process.env.AUTH_ISSUER) {
          return reject(new InvalidToken("Invalid token. issuer is invalid"));
        }
        if (!claims.user_id) {
          return reject(new InvalidToken("Invalid token. user is empty"));
        }
        if (!claims.jti) {
          return reject(
            new InvalidToken("Invalid token. jwt token ID is empty")
          );
        }

        Promise.all([
          getAccessTokenById(claims.jti),
          getUserById(claims.user_id),
        ]).then(([token, user]) => {
          if (!user || !token) {
            return reject(
              new InvalidToken(
                "Invalid token. user or token record does not exist"
              )
            );
          }
          if (!token.active) {
            return reject(new InvalidToken("Invalid token. token is expired"));
          }
          return resolve({
            sub: claims.sub,
            scope: null,
            iss: claims.iss,
            nbf: undefined,
            exp: claims.exp,
            iat: undefined,
            jti: claims.jti,
            aud: claims.aud,
            client_id: claims.client_id,
            username: user.name,
          });
        });
      }
    );
  });
}
