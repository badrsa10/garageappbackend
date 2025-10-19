import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getModelsByMarque = async (marque: string) => {
  try {
    const models = await prisma.marqueModel.findMany({
      where: { marque },
      select: { model: true },
    });

    return models.map((entry) => entry.model);
  } catch (error) {
    console.error('Error fetching models for marque:', error);
    throw new Error('Failed to fetch models');
  }
};
