import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/lib/prisma"; // Adjust the path to your Prisma setup

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  // GET: Fetch a specific Commande
  if (req.method === "GET") {
    try {
      const commande = await prisma.commande.findUnique({
        where: { id_commande: String(id) },
        include: { lines: true, fournisseur: true }, // Include related lines and fournisseur
      });

      if (!commande) {
        return res.status(404).json({ error: "Commande not found" });
      }

      return res.status(200).json(commande);
    } catch (error) {
      console.error("Error fetching commande:", JSON.stringify(error, null, 4));
      return res.status(500).json({ error: "Failed to fetch commande" });
    }
  }

  // PUT: Update a specific Commande
  else if (req.method === "PUT") {
    const { fournisseurId, etat, lines } = req.body;

    // Validate required fields
    if (!fournisseurId || !etat) {
      return res
        .status(400)
        .json({ error: "Missing required fields or invalid lines" });
    }

    try {
      // Update the Commande
      const updatedCommande = await prisma.commande.update({
        where: { id_commande: String(id) },
        data: {
          fournisseurId,
          etat,
        },
      });

      return res.status(200).json(updatedCommande);
    } catch (error) {
      console.error("Error updating commande:", error);
      return res.status(500).json({ error: "Failed to update commande" });
    }
  }

  // DELETE: Remove a specific Commande
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
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
