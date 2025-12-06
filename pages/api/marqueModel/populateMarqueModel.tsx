import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../src/lib/prisma";
import Prisma from "@prisma/client";
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Read the JSON file from the data directory
      const filePath = path.join(process.cwd(), 'src', 'data', 'cars.json');
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const cars = JSON.parse(fileContents);

      // Iterate through each marque and model
      for (const item of cars) {
        const marque = item.brand;
        for (const model of item.models) {
          
          const newCar = await prisma.marqueModel.create({
            data: {
              marque,
              model,
            },
          });
          console.log('car: ', JSON.stringify(newCar, null, 4));
        }
      }

      res.status(201).json({ message: 'Database populated successfully' });
    } catch (error) {
      console.error('Error populating database:', JSON.stringify(error, null, 4));
      res.status(500).json({ error: 'Failed to populate database' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
