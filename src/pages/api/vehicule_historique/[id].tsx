import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const historique = await prisma.vehiculeHistorique.findUnique({
        where: { id_vehicule_historique: id as string },
        include: {
          vehicule: true,
          service: true,
          piece: true,
        },
      });

      if (!historique) {
        return res.status(404).json({ error: 'Historique not found' });
      }

      return res.status(200).json(historique);
    } catch (error) {
      console.error('Error details:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  } else if (req.method === 'PUT') {
    const {
      vehiculeId,
      date_historique,
      kilometrage,
      pieceId,
      serviceId,
      libelle_pieceouservice,
      remarque,
    } = req.body;

    if (!vehiculeId || !date_historique || (!pieceId && !serviceId)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Validate if only one of pieceId or serviceId is provided
      if (pieceId && serviceId) {
        return res.status(400).json({ error: 'Provide either pieceId or serviceId, not both' });
      }

      const updatedHistorique = await prisma.vehiculeHistorique.update({
        where: { id_vehicule_historique: id as string },
        data: {
          vehiculeId,
          date_historique: new Date(date_historique),
          kilometrage: kilometrage ? parseInt(kilometrage, 10) : null,
          pieceId: pieceId || null,
          serviceId: serviceId || null,
          libelle_pieceouservice,
          remarque,
        },
      });

      return res.status(200).json(updatedHistorique);
    } catch (error) {
      console.error('Error details:', JSON.stringify(error, null, 4));
      return res.status(500).json({ error: 'Failed to update historique' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.vehiculeHistorique.delete({
        where: { id_vehicule_historique: id as string },
      });

      return res.status(204).end(); // No Content
    } catch (error) {
      console.error('Error details:', JSON.stringify(error, null, 4));
      return res.status(500).json({ error: 'Failed to delete historique' });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
