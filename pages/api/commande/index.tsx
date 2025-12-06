import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/lib/prisma";
import { Prisma } from "@prisma/client";

// Generate a unique id_commande
const generateCommandeId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const lastCommande = await prisma.commande.findMany({
    where: {
      id_commande: {
        startsWith: `CMD-${year}${month}`,
      },
    },
    orderBy: {
      id_commande: "desc",
    },
    take: 1,
  });

  let increment = 1;
  if (lastCommande.length > 0) {
    const lastId = lastCommande[0].id_commande;
    const lastIncrement = parseInt(lastId.slice(-4), 10);
    increment = lastIncrement + 1;
  }

  return `CMD-${year}${month}-${String(increment).padStart(4, "0")}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://161.35.45.86");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET: Paginated, filtered list of commandes
  if (req.method === "GET") {
    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      etat,
      fournisseurId,
      startDate,
      endDate,
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const order = sortOrder === "asc" ? "asc" : "desc";
    const validSortFields = ["etat", "createdAt", "updatedAt"];

    if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    if (!validSortFields.includes(sortBy as string)) {
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }

    try {
      const filters: any = {};

      if (etat) filters.etat = etat;
      if (fournisseurId) filters.fournisseurId = fournisseurId;
      if (startDate && endDate) {
        filters.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const totalCommandes = await prisma.commande.count({ where: filters });
      const totalPages = Math.ceil(totalCommandes / pageSize);

      const commandes = await prisma.commande.findMany({
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: {
          fournisseur: true,
          lines: { include: { piece: true } },
        },
      });

      return res.status(200).json({
        data: commandes,
        meta: {
          totalCommandes,
          totalPages,
          currentPage: pageNumber,
          pageSize,
        },
      });
    } catch (error) {
      console.error("Error fetching commandes:", error);
      return res.status(500).json({ error: "Failed to fetch commandes" });
    }
  }

  // POST: Create new commande with lines
  if (req.method === "POST") {
    const { fournisseurId, etat, lines } = req.body;

    const validEtats = ["EN_ATTENTE", "VALIDE", "LIVREE", "ANNULEE"];
    if (!fournisseurId || !etat || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: "Missing required fields or invalid lines" });
    }

    if (!validEtats.includes(etat)) {
      return res.status(400).json({ error: "Invalid etat value" });
    }

    for (const line of lines) {
      if (!line.pieceId || !line.quantite || !line.prix_unite) {
        return res.status(400).json({ error: "Invalid line item" });
      }
    }

    try {
      const id_commande = await generateCommandeId();

      const newCommande = await prisma.commande.create({
        data: {
          id_commande,
          fournisseurId,
          etat,
          lines: {
            create: lines.map((line: any) => ({
              pieceId: line.pieceId,
              quantite: line.quantite,
              prix_unite: line.prix_unite,
              prix_total: line.quantite * line.prix_unite,
            })),
          },
        },
        include: {
          fournisseur: true,
          lines: { include: { piece: true } },
        },
      });

      return res.status(201).json(newCommande);
    } catch (error) {
      console.error("Error creating commande:", error);
      return res.status(500).json({ error: "Failed to create commande" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
