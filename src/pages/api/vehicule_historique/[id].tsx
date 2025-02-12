import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const historiqueId = id as string;

  if (!historiqueId) {
    return res.status(400).json({ error: "Invalid historique ID" });
  }

  if (req.method === "GET") {
    try {
      const historique = await prisma.vehiculeHistorique.findUnique({
        where: { id_vehicule_historique: historiqueId },
        include: {
          vehicule: true, // Inclure les informations du véhicule
          service: true, // Inclure les informations du service
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
  }

  // PUT - Update an existing historical record
  else if (req.method === "PUT") {
    const { vehiculeId, date_historique, serviceId, libelle_service } = req.body;

    if (!vehiculeId || !date_historique || !serviceId || !libelle_service) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const updatedHistorique = await prisma.vehiculeHistorique.update({
        where: { id_vehicule_historique: historiqueId },
        data: {
          vehiculeId,
          date_historique: new Date(date_historique),
          serviceId,
          libelle_service,
        },
      });

      return res.status(200).json(updatedHistorique);
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to update historique" });
    }
  }

  // DELETE - Delete the historical record
  else if (req.method === "DELETE") {
    try {
      const deletedHistorique = await prisma.vehiculeHistorique.delete({
        where: { id_vehicule_historique: historiqueId },
      });

      return res.status(200).json({ message: "Historique deleted successfully", data: deletedHistorique });
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to delete historique" });
    }
  }

  // Handle unsupported HTTP methods
  else {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
