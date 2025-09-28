import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
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

  // Handle GET requests to fetch a specific service
  if (req.method === "GET") {
    try {
      const service = await prisma.service.findUnique({
        where: { id_service: String(id) },
      });

      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      return res.status(200).json(service);
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  // Handle PUT requests to update a specific service
  else if (req.method === "PUT") {
    const { libelle } = req.body;

    // Validate if the required field is provided
    if (!libelle) {
      return res
        .status(400)
        .json({ error: "Missing required field 'libelle'" });
    }

    try {
      const updatedService = await prisma.service.update({
        where: { id_service: String(id) },
        data: { libelle },
      });

      return res.status(200).json(updatedService);
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 4));
      return res.status(500).json({ error: "Failed to update service" });
    }
  }

  // Handle DELETE requests to remove a specific service
  else if (req.method === "DELETE") {
    try {
      await prisma.service.delete({
        where: { id_service: String(id) },
      });

      return res.status(204).end(); // No Content
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to delete service" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
