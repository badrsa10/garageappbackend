import { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../lib/prisma'; 

// GET, PUT, DELETE handler for specific commande
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // GET: Fetch a specific commande
  if (req.method === "GET") {
    try {
      const commande = await prisma.commande.findUnique({
        where: { id_commande: String(id) },
        include: { piece: true, fournisseur: true },
      });

      if (!commande) return res.status(404).json({ error: "Commande not found" });

      return res.status(200).json(commande);
    } catch (error) {
      console.error("Error fetching commande:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // PUT: Update a specific commande
  else if (req.method === "PUT") {
    const { pieceId, fournisseurId, etat, quantite, prix_unite, prix_total } = req.body;

    if (!pieceId || !fournisseurId || !etat || !quantite || !prix_unite || !prix_total) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const updatedCommande = await prisma.commande.update({
        where: { id_commande: String(id) },
        data: { pieceId, fournisseurId, etat, quantite, prix_unite, prix_total },
      });

      return res.status(200).json(updatedCommande);
    } catch (error) {
      console.error("Error updating commande:", error);
      return res.status(500).json({ error: "Failed to update commande" });
    }
  }

  // DELETE: Remove a specific commande
  else if (req.method === "DELETE") {
    try {
      await prisma.commande.delete({
        where: { id_commande: String(id) },
      });

      return res.status(204).end(); // No Content
    } catch (error) {
      console.error("Error deleting commande:", error);
      return res.status(500).json({ error: "Failed to delete commande" });
    }
  }

  // Method Not Allowed
  else {
    return res.status(405).end();
  }
}
