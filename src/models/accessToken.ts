import { prismaClient } from './prismaClient';

export async function createAccessToken(userId: string) {
  return await prismaClient.accessToken
          .create({
            data: {
              user_id: userId,
              active: true
            }
          })
}


export async function getAccessTokenById(id: string) {
  return await prismaClient.accessToken
  .findUnique({
    where: {
      id: id
    },
  })
}

export async function invalidateTokensByUser(userId: string) {
  return await prismaClient.accessToken
  .updateMany({
    where: {
      user_id: userId,
      active: true
    },
    data: {
      active: false
    }
  })
}

export async function markAccessTokenAsInactive(id: string) {
  return await prismaClient.accessToken
  .update({
    where: {
      id: id
    },
    data: {
      active: false
    }
  })
}
