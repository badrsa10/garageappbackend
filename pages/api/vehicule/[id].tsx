import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://161.35.45.86");
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

  try {
    // GET: Fetch a specific vehicle
    if (req.method === "GET") {
      const vehicule = await prisma.vehicule.findUnique({
        where: { id_vehicule: String(id) },
        include: { client: true, VehiculeHistorique: true },
      });

      if (!vehicule)
        return res.status(404).json({ error: "Vehicule not found" });

      return res.status(200).json(vehicule);
    }

    // PUT: Update a specific vehicle
    else if (req.method === "PUT") {
      const {
        marque,
        modele,
        annee,
        kilometrage,
        matricule,
        numeroSerie,
        clientId,
      } = req.body;
      console.log("req.body:", JSON.stringify(req.body, null, 2));

      const updateData: any = {
        marque,
        modele,
        annee,
        kilometrage,
        matricule,
        numeroSerie,
        //clientId
      };

      if ("clientId" in req.body) {
        updateData.client = clientId
          ? { connect: { id_client: clientId } }
          : { disconnect: true };
      }
      console.error("updateData:", JSON.stringify(updateData, null, 2));
      console.error(
        "updateData.client:",
        JSON.stringify(updateData.client, null, 2)
      );

      try {
        const existing = await prisma.vehicule.findUnique({
          where: { id_vehicule: String(id) },
        });

        if (!existing) {
          return res.status(404).json({ error: "Vehicule not found" }); // ✅ valid object
        }
        console.log("existing:", JSON.stringify(existing, null, 2));

        const clientExists = await prisma.client.findUnique({
          where: { id_client: clientId },
        });
        console.log("clientExists:", JSON.stringify(clientExists, null, 2));

        if (!clientExists) {
          return res.status(404).json({ error: "Client not found" });
        }

        const updatedVehicule = await prisma.vehicule.update({
          where: { id_vehicule: String(id) },
          data: updateData,
        });
        console.log(
          "Updated vehicule:",
          JSON.stringify(updatedVehicule, null, 2)
        );

        return res.status(200).json(updatedVehicule); // ✅ guaranteed to be non-null
      } catch (error: any) {
        console.log("Error handling vehicule:", JSON.stringify(error, null, 2));
        console.error("Error handling vehicule:", error);

        const safeMessage =
          typeof error?.message === "string" && error.message.trim().length > 0
            ? error.message
            : "Internal Server Error";
        console.log("Error handling vehicule:", JSON.stringify(error, null, 2));

        return res.status(500).json({ error: safeMessage });
      }
    }

    // DELETE: Remove a specific vehicle
    else if (req.method === "DELETE") {
      try {
        await prisma.vehicule.delete({
          where: { id_vehicule: String(id) },
        });

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("Error deleting vehicule:", error);
        return res.status(500).json({ error: "Failed to delete vehicule" });
      }
    }

    // Method Not Allowed
    else {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error handling vehicule:", error);
    console.log("Error handling vehicule:", JSON.stringify(error, null, 2));
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
