import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { ResourceNotFoundError, ClientError } from "../routes/errorHandler";
import { createUser, getUserByEmail, getAllUsers } from "../models/users";
import { invalidateTokensByUser } from "../models/accessToken";
import axios from "axios";

export async function signup(input: Prisma.UserCreateInput) {
  const user = await createUser(input);
  const response = await axios.post(`${process.env.BASE_URL}/jwt/issue`, {
    attributes: { user_id: user.id },
  });

  return response.data.token;
}

export async function login(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ResourceNotFoundError("user not found");
  }
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw new ClientError("invalid password");
  }

  // invalidate existing tokens
  await invalidateTokensByUser(user.id);

  const response = await axios.post(`${process.env.BASE_URL}/jwt/issue`, {
    attributes: { user_id: user.id },
  });

  return response.data.token;
}

export async function getUsers() {
  const users = await getAllUsers();
  return users.map((user) => {
    return {
      name: user.name,
      email: user.email,
    };
  });
}

export async function verifyPassword(password: string, hashPassword: string) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashPassword, function (err, result) {
      if (err) {
        return reject("Error in verifyPassword:" + err?.message);
      }
      resolve(result);
    });
  });
}
