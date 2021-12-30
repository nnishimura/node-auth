import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "jest-mock-extended";
import { introspectToken, createToken } from "../../src/services/accessToken";
import { prismaMock } from "../prismaMock";

jest.mock("../../src/models/prismaClient", () => ({
  __esModule: true,
  prismaClient: mockDeep<PrismaClient>(),
}));

describe("introspectToken", () => {
  const validUserId = "95d8c69b-16af-488a-a03e-d72c269fdf4d";
  const tokenId = "86d8c69b-16af-488a-a03e-d72c269fdf4d";
  beforeEach(() => {
    mockReset(prismaMock);

    const user = {
      id: validUserId,
      name: "auth.senorita",
      email: "test@test.com",
      password: "hashed",
      created_at: new Date(),
      updated_at: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    const token = {
      id: tokenId,
      active: true,
      user_id: validUserId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    prismaMock.accessToken.create.mockResolvedValue(token);
    prismaMock.accessToken.findUnique.mockResolvedValue(token);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should throw if token is expired", async (done) => {
    const clientId = process.env.CLIENT_ID as string;
    const secret = process.env.AUTH_JWT_SECRET as string;
    const oldToken = jwt.sign(
      {
        user_id: validUserId,
        iss: process.env.AUTH_ISSUER,
        client_id: clientId,
        aud: clientId,
      },
      secret,
      { expiresIn: "-1 days" }
    );
    await expect(() => introspectToken(oldToken)).rejects.toThrow();
    done();
  });

  test("should throw if token issuer is invalid", async (done) => {
    const clientId = process.env.CLIENT_ID as string;
    const secret = process.env.AUTH_JWT_SECRET as string;
    const token = jwt.sign(
      {
        user_id: validUserId,
        iss: "invalid-issuer",
        client_id: clientId,
        aud: clientId,
      },
      secret,
      { expiresIn: 60 * 60 * 60 }
    );

    await expect(() => introspectToken(token)).rejects.toThrow();
    done();
  });

  test("should return claim for valid token", async () => {
    const t = await createToken({ user_id: validUserId });
    const claim = await introspectToken(t);
    expect(claim).toBeDefined();
  });
});
