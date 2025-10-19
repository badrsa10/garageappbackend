import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // CORS headers
  res.setHeader("Access-Control-Allow-Oraigin", "http://167.99.90.103:4200");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Disable caching
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  const { marque, model } = req.query;

  if (typeof marque !== 'string' || typeof model !== 'string') {
    return res.status(400).json({ error: 'Invalid marque or model format' });
  }



  // Handle GET request to fetch a specific marque model
  if (req.method === 'GET') {
    try {
      const marqueModel = await prisma.marqueModel.findUnique({
        where: {
          marque_model: {
            marque,
            model,
          },
        },
      });

      if (!marqueModel) {
        return res.status(404).json({ error: 'Marque model not found' });
      }

      return res.status(200).json(marqueModel);
    } catch (error) {
      console.error('Error fetching marque model:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  // Handle PUT request to update a specific marque model
  else if (req.method === 'PUT') {
    const { newMarque, newModel } = req.body;

    // Validate if the required fields are provided
    if (!newMarque || !newModel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const updatedMarqueModel = await prisma.marqueModel.update({
        where: {
          marque_model: {
            marque,
            model,
          },
        },
        data: {
          marque: newMarque,
          model: newModel,
        },
      });

      return res.status(200).json(updatedMarqueModel);
    } catch (error) {
      console.error('Error updating marque model:', error);
      return res.status(500).json({ error: 'Failed to update marque model' });
    }
  }

  // Handle DELETE request to delete a specific marque model
  else if (req.method === 'DELETE') {
    try {
      await prisma.marqueModel.delete({
        where: {
          marque_model: {
            marque,
            model,
          },
        },
      });

      return res.status(204).end(); // No Content
    } catch (error) {
      console.error('Error deleting marque model:', error);
      return res.status(500).json({ error: 'Failed to delete marque model' });
    }
  }

  else {
    return res.status(405).end(); // Method Not Allowed
  }
}
