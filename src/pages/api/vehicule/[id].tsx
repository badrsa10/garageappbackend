import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    // GET: Fetch a specific vehicle
    if (req.method === 'GET') {
      const vehicule = await prisma.vehicule.findUnique({
        where: { id_vehicule: String(id) },
        include: { client: true, VehiculeHistorique: true },
      });

      if (!vehicule) return res.status(404).json({ error: 'Vehicule not found' });

      return res.status(200).json(vehicule);
    }

    // PUT: Update a specific vehicle
    else if (req.method === 'PUT') {
      const { marque, modele, annee, kilometrage, matricule, numeroSerie } = req.body;

      const updatedVehicule = await prisma.vehicule.update({
        where: { id_vehicule: String(id) },
        data: { marque, modele, annee, kilometrage, matricule, numeroSerie },
      });

      return res.status(200).json(updatedVehicule);
    }

    // DELETE: Remove a specific vehicle
    else if (req.method === 'DELETE') {
      await prisma.vehicule.delete({
        where: { id_vehicule: String(id) },
      });

      return res.status(204).end(); // No Content
    }

    // Method Not Allowed
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error handling vehicule:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
