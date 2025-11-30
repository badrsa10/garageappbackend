import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/lib/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://161.35.45.86");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  const id_commande = String(id);

  // GET: Fetch a specific Commande
  if (req.method === "GET") {
    try {
      const commande = await prisma.commande.findUnique({
        where: { id_commande },
        include: {
          fournisseur: true,
          lines: { include: { piece: true } },
        },
      });

      if (!commande) {
        return res.status(404).json({ error: "Commande not found" });
      }

      return res.status(200).json(commande);
    } catch (error) {
      console.error("Error fetching commande:", error);
      return res.status(500).json({ error: "Failed to fetch commande" });
    }
  }

  // PUT: Update Commande + optional lines
  if (req.method === "PUT") {
    const { fournisseurId, etat, lines } = req.body;

    const validEtats = ["EN_ATTENTE", "VALIDE", "LIVREE", "ANNULEE"];
    if (!fournisseurId || !etat || !validEtats.includes(etat)) {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    try {
      // Update main commande fields
      await prisma.commande.update({
        where: { id_commande },
        data: { fournisseurId, etat },
      });

      // Optional: replace lines
      if (Array.isArray(lines) && lines.length > 0) {
        await prisma.commandeLine.deleteMany({ where: { commandeId: id_commande } });

        await prisma.commandeLine.createMany({
          data: lines.map((line: any) => ({
            commandeId: id_commande,
            pieceId: line.pieceId,
            quantite: line.quantite,
            prix_unite: line.prix_unite,
            prix_total: line.quantite * line.prix_unite,
          })),
        });
      }

      const updated = await prisma.commande.findUnique({
        where: { id_commande },
        include: {
          fournisseur: true,
          lines: { include: { piece: true } },
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating commande:", error);
      return res.status(500).json({ error: "Failed to update commande" });
    }
  }

  // DELETE: Remove Commande + cascade lines
  if (req.method === "DELETE") {
    try {
      await prisma.commandeLine.deleteMany({ where: { commandeId: id_commande } });
      await prisma.commande.delete({ where: { id_commande } });

      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting commande:", error);
      return res.status(500).json({ error: "Failed to delete commande" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
