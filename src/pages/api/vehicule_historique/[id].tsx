import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
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
  const { id } = req.query;

  if (req.method === "GET") {
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
        return res.status(404).json({ error: "Historique not found" });
      }

      return res.status(200).json(historique);
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  } else if (req.method === "PUT") {
    const {
      vehiculeId,
      date_historique,
      kilometrage,
      pieceId,
      serviceId,
      libelle_pieceouservice,
      remarque,
    } = req.body;

    try {
      // Validate mutual exclusivity
      if (pieceId && serviceId) {
        return res.status(400).json({
          error: "Provide either pieceId or serviceId, not both",
        });
      }

      // Build update payload dynamically
      const updateData: any = {};

      if (vehiculeId) updateData.vehiculeId = vehiculeId;
      if (date_historique)
        updateData.date_historique = new Date(date_historique);
      if (kilometrage !== undefined)
        updateData.kilometrage = parseInt(kilometrage, 10);
      if (pieceId !== undefined) updateData.pieceId = pieceId;
      if (serviceId !== undefined) updateData.serviceId = serviceId;
      if (libelle_pieceouservice !== undefined)
        updateData.libelle_pieceouservice = libelle_pieceouservice;
      if (remarque !== undefined) updateData.remarque = remarque;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });
      }

      const updatedHistorique = await prisma.vehiculeHistorique.update({
        where: { id_vehicule_historique: id as string },
        data: updateData,
      });

      return res.status(200).json(updatedHistorique);
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 4));
      return res.status(500).json({ error: "Failed to update historique" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.vehiculeHistorique.delete({
        where: { id_vehicule_historique: id as string },
      });

      return res.status(204).end(); // No Content
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 4));
      return res.status(500).json({ error: "Failed to delete historique" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
