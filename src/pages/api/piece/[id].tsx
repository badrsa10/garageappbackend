import { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../lib/prisma'; 

// Handler for managing a specific piece by id
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Handle GET requests to fetch a specific piece
  if (req.method === "GET") {
    try {
      const piece = await prisma.piece.findUnique({
        where: { id_piece: String(id) },
      });

      if (!piece) return res.status(404).json({ error: "Piece not found" });

      return res.status(200).json(piece);
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  // Handle PUT requests to update a specific piece
  else if (req.method === "PUT") {
    const { libelle, quantite } = req.body;

    if (!libelle || !quantite) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const updatedPiece = await prisma.piece.update({
        where: { id_piece: String(id) },
        data: { libelle, quantite },
      });

      return res.status(200).json(updatedPiece);
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  // Handle DELETE requests to remove a specific piece
  else if (req.method === "DELETE") {
    try {
      await prisma.piece.delete({
        where: { id_piece: String(id) },
      });

      return res.status(204).end(); // No Content
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  // Method Not Allowed
  else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
