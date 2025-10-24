import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/lib/prisma";

const generateHistoriqueId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const lastHistorique = await prisma.vehiculeHistorique.findMany({
    where: {
      id_vehicule_historique: {
        startsWith: `VHI-${year}${month}`,
      },
    },
    orderBy: {
      id_vehicule_historique: "desc",
    },
    take: 1,
  });

  let increment = 1;
  if (lastHistorique.length > 0) {
    const lastId = lastHistorique[0].id_vehicule_historique;
    const lastIncrement = parseInt(lastId.slice(-4), 10);
    increment = lastIncrement + 1;
  }

  return `VHI-${year}${month}-${String(increment).padStart(4, "0")}`;
};

/**
 * Function to fetch libelle_pieceouservice based on pieceId or serviceId
 */
const getPieceOuServiceLibelle = async (
  pieceouserviceId: string,
  res: NextApiResponse
) => {
  if (pieceouserviceId.startsWith("SRV")) {
    const service = await prisma.service.findUnique({
      where: { id_service: pieceouserviceId },
      select: { libelle: true },
    });
    if (!service) {
      return res
        .status(400)
        .json({ error: "Invalid serviceId, libelle_service not found" });
    }
    return service.libelle;
  } else if (pieceouserviceId.startsWith("PIC")) {
    const piece = await prisma.piece.findUnique({
      where: { id_piece: pieceouserviceId },
      select: { libelle: true },
    });
    if (!piece) {
      return res
        .status(400)
        .json({ error: "Invalid pieceId, libelle_piece not found" });
    }
    return piece.libelle;
  }
  return res.status(400).json({ error: "Invalid pieceouserviceId format" });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://161.35.45.86:4200");
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
  if (req.method === "GET") {
    const {
      page = "1",
      limit = "10",
      search = [],
      sortBy = "date_historique",
      sortOrder = "asc",
      vehiculeId,
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const order = sortOrder === "desc" ? "desc" : "asc";

    const validSortFields = [
      "date_historique",
      "libelle_pieceouservice",
      "pieceId",
      "serviceId",
      "vehiculeId",
    ];

    if (
      isNaN(pageNumber) ||
      isNaN(pageSize) ||
      pageNumber < 1 ||
      pageSize < 1
    ) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    if (!validSortFields.includes(sortBy as string)) {
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }

    try {
      let searchTerms = Array.isArray(search) ? search : [search];
      searchTerms = searchTerms
        .map((term) => String(term).trim())
        .filter((term) => term.length > 0);

      const filters: any = {};

      if (searchTerms.length > 0) {
        filters.OR = searchTerms.map((term) => ({
          OR: [
            { libelle_pieceouservice: { contains: term, mode: "insensitive" } },
            { remarque: { contains: term, mode: "insensitive" } },
            { vehiculeId: { contains: term, mode: "insensitive" } },
          ],
        }));
      }

      if (vehiculeId) {
        filters.vehiculeId = String(vehiculeId);
      }

      const historiques = await prisma.vehiculeHistorique.findMany({
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: {
          vehicule: true,
          service: true,
          piece: true,
        },
      });

      const totalHistoriques = await prisma.vehiculeHistorique.count({
        where: filters,
      });
      const totalPages = Math.ceil(totalHistoriques / pageSize);

      return res.status(200).json({
        data: historiques,
        meta: {
          totalHistoriques,
          totalPages,
          currentPage: pageNumber,
          pageSize,
        },
      });
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  } else if (req.method === "POST") {
    const {
      vehiculeId,
      date_historique,
      kilometrage,
      pieceId,
      serviceId,
      libelle_pieceouservice,
      remarque,
    } = req.body;

    if (!vehiculeId || (!pieceId && !serviceId)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate if only one of pieceId or serviceId is provided
    if (pieceId && serviceId) {
      return res
        .status(400)
        .json({ error: "Provide either pieceId or serviceId, not both" });
    }

    // Validate data types
    if (
      typeof vehiculeId !== "string" ||
      (kilometrage !== undefined && typeof kilometrage !== "number") ||
      (pieceId !== null && typeof pieceId !== "string") ||
      (serviceId !== null && typeof serviceId !== "string")
    ) {
      return res.status(400).json({ error: "Invalid data types" });
    }

    try {
      const id_vehicule_historique = await generateHistoriqueId();

      // Determine final libelle_pieceouservice
      let finalLibellePieceOuService =
        libelle_pieceouservice && libelle_pieceouservice.trim() !== ""
          ? libelle_pieceouservice
          : await getPieceOuServiceLibelle(pieceId || serviceId, res);

      // The function will handle errors and return a response, so we only proceed if finalLibellePieceOuService is valid
      if (typeof finalLibellePieceOuService !== "string") {
        return; // The error response is already sent by the helper function
      }

      const newHistorique = await prisma.vehiculeHistorique.create({
        data: {
          id_vehicule_historique,
          vehiculeId,
          date_historique: new Date(date_historique),
          kilometrage:
            kilometrage !== undefined ? parseInt(kilometrage, 10) : null,
          pieceId,
          serviceId,
          libelle_pieceouservice: finalLibellePieceOuService,
          remarque,
        },
      });

      return res.status(201).json(newHistorique);
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 4));
      return res.status(500).json({ error: "Failed to create historique" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
