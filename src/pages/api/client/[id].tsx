import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  //GET  
  if (req.method === 'GET') {
    // Fetch a specific client
    const client = await prisma.client.findUnique({
      where: { id_client: String(id) },
      //include: { vehicule: true },
    });
    return res.status(200).json(client);
  } 
  //PUT
  else if (req.method === 'PUT') {
    // Update a specific client
    const { nom, prenom, email, tel, type_personne } = req.body;

    const updatedClient = await prisma.client.update({
      where: { id_client: String(id) },
      data: { nom, prenom, email, tel, type_personne }
    });

    return res.status(200).json(updatedClient);
  }
  //DELETE 
  else if (req.method === 'DELETE') {
    // Delete a specific client
    await prisma.client.delete({
      where: { id_client: String(id) }
    });

    return res.status(204).end(); // No Content
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}