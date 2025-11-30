import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient(); 
// ⚠️ inutile de repasser datasources ici, car déjà défini via schema/env
