import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';

import { prismaClient } from '../src/models/prismaClient';

export const prismaMock = prismaClient as unknown as DeepMockProxy<PrismaClient>;
