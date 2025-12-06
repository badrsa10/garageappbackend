import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/lib/prisma";
import Prisma from "@prisma/client";
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
  //GET
  if (req.method === "GET") {
    // Fetch a specific client
    const client = await prisma.client.findUnique({
      where: { id_client: String(id) },
      //include: { vehicule: true },
    });
    return res.status(200).json(client);
  }
  //PUT
  else if (req.method === "PUT") {
    // Update a specific client
    const { nom, prenom, email, tel, type_personne } = req.body;

    const updatedClient = await prisma.client.update({
      where: { id_client: String(id) },
      data: { nom, prenom, email, tel, type_personne },
    });

    return res.status(200).json(updatedClient);
  }
  //DELETE
  // DELETE
  else if (req.method === "DELETE") {
    try {
      const existing = await prisma.client.findUnique({
        where: { id_client: String(id) },
      });

      if (!existing) {
        return res.status(404).json({ error: "Client not found" });
      }

      await prisma.client.delete({
        where: { id_client: String(id) },
      });

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("❌ Error deleting client:", error);
      return res
        .status(500)
        .json({ error: error?.message || "Failed to delete client" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
