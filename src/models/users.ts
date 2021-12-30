import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prismaClient } from './prismaClient';

const SALT_ROUNDS = 10;

/*
 * hash password and inserts user record on DB
 */
export async function createUser(input: Prisma.UserCreateInput) {
  return new Promise<User>((resolve, reject) => {
    bcrypt.genSalt(SALT_ROUNDS, function (err, salt) {
      if (err) {
        return reject('Error in bcrypt.genSalt:' + err?.message);
      }

      bcrypt.hash(input.password, salt, function (err, hash) {
        if (err) {
          return reject(new Error('Error in bcrypt.hash:' + err?.message));
        }
        prismaClient.user
          .create({
            data: {
              ...input,
              password: hash,
            },
          })
          .then((user) => {
            resolve(user);
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  });
}

export async function getUserByEmail(email: string) {
  return await prismaClient.user.findUnique({
    where: {
      email,
    },
  });
}

export async function getUserById(id: string) {
  return await prismaClient.user.findUnique({
    where: {
      id,
    },
  });
}

export async function getAllUsers() {
  return await prismaClient.user.findMany();
}
