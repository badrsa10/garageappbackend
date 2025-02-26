import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    // GET: Fetch a specific fournisseur
    if (req.method === 'GET') {
      const fournisseur = await prisma.fournisseur.findUnique({
        where: { id_fournisseur: String(id) },
        include: { Commande: true }, // Include related Commande if needed
      });

      if (!fournisseur) return res.status(404).json({ error: 'Fournisseur not found' });

      return res.status(200).json(fournisseur);
    }

    // PUT: Update a specific fournisseur
    else if (req.method === 'PUT') {
      const { nom, prenom, email, tel } = req.body;

      const updatedFournisseur = await prisma.fournisseur.update({
        where: { id_fournisseur: String(id) },
        data: { nom, prenom, email, tel },
      });

      return res.status(200).json(updatedFournisseur);
    }

    // DELETE: Remove a specific fournisseur
    else if (req.method === 'DELETE') {
      await prisma.fournisseur.delete({
        where: { id_fournisseur: String(id) },
      });

      return res.status(204).end(); // No Content
    }

    // Method Not Allowed
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error handling fournisseur:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
