import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Function to generate the id_commande
const generateCommandeId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // Fetch the last commande based on the generated ID pattern
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

// GET function to retrieve paginated commande data
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { page = 1, limit = 10, search = [], sortBy = "etat", sortOrder = "asc" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const sortFields = ["etat", "quantite", "prix_unite", "prix_total"];
    const order = sortOrder === "desc" ? "desc" : "asc";

    // Validate pagination parameters
    if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    // Validate sorting parameters
    if (!sortFields.includes(sortBy as string)) {
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }

    try {
      let searchTerms = Array.isArray(search) ? search : [search];
      searchTerms = searchTerms.map((term) => String(term).trim()).filter((term) => term.length > 0);

      // Construct dynamic filter based on search query
      let filters = {};
      if (searchTerms.length > 0) {
        filters = {
          OR: searchTerms.map((term) => ({
            OR: [
              { etat: { contains: term } },
              { piece: { libelle: { contains: term } } },
              { fournisseur: { nom: { contains: term } } },
            ],
          })),
        };
      }

      // Fetch paginated commande data
      const commandes = await prisma.commande.findMany({
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: { piece: true, fournisseur: true },
      });

      // Count the total number of commandes for pagination metadata
      const totalCommandes = await prisma.commande.count({ where: filters });
      const totalPages = Math.ceil(totalCommandes / pageSize);

      // Return the data and pagination meta-information
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
      console.error("Error details:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  // POST function to create a new commande
  else if (req.method === "POST") {
    const { pieceId, fournisseurId, etat, quantite, prix_unite, prix_total } = req.body;

    // Validate required fields
    if (!pieceId || !fournisseurId || !etat || !quantite || !prix_unite || !prix_total) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Generate the id_commande
      const id_commande = await generateCommandeId();
      console.log("Generated id_commande:", id_commande);

      // Create a new commande in the database
      const newCommande = await prisma.commande.create({
        data: {
          id_commande,
          pieceId,
          fournisseurId,
          etat,
          quantite,
          prix_unite,
          prix_total,
        },
      });

      return res.status(201).json(newCommande);
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to create commande" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
