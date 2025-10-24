import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://161.35.45.86:4200");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid or missing id" });
  }

  try {
    if (req.method === "GET") {
      const piece = await prisma.piece.findUnique({
        where: { id_piece: id },
      });
      if (!piece) {
        return res.status(404).json({ error: "Piece not found" });
      }
      return res.status(200).json({ data: piece });
    } else if (req.method === "PUT") {
      const { libelle, quantite } = req.body;

      // Build update object dynamically
      const updateData: any = {};
      if (typeof libelle === "string") updateData.libelle = libelle;
      if (typeof quantite === "number") updateData.quantite = quantite;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const updatedPiece = await prisma.piece.update({
        where: { id_piece: String(id) },
        data: updateData,
      });

      return res.status(200).json({ data: updatedPiece });
    } else if (req.method === "DELETE") {
      await prisma.piece.delete({
        where: { id_piece: id },
      });
      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error details:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
