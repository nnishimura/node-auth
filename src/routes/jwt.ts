import { Request, Response, Router } from "express";
import { celebrate } from "celebrate";
import { tokenIssueSchema, introspectSchema } from "./schema";
import { issueToken, introspectToken } from "../services/accessToken";
import { parseErrorResponse } from "./errorHandler";

export default (router: Router) => {
  router.post(
    "/jwt/issue",
    celebrate(tokenIssueSchema),
    async (req: Request, res: Response) => {
      console.log("Incoming request for POST /jwt/issue");
      issueToken(req.body.attributes.user_id, req.body.refreshToken)
        .then((token) => {
          return res.status(200).json({ token });
        })
        .catch((err) => {
          console.error(err);
          const parsedError = parseErrorResponse(err);
          return res.status(parsedError.statusCode).json(parsedError);
        });
    }
  );

  router.post(
    "/jwt/introspect",
    celebrate(introspectSchema),
    async (req: Request, res: Response) => {
      console.log("Incoming request for POST /jwt/introspect");
      introspectToken(req.body.token)
        .then((claims) => {
          return res.status(200).json(claims);
        })
        .catch((err) => {
          console.error(err);
          const parsedError = parseErrorResponse(err);
          return res.status(parsedError.statusCode).json(parsedError);
        });
    }
  );

  return router;
};
