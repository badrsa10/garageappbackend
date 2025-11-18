import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/lib/prisma";

// Function to generate the id_fournisseur
const generateFournisseurId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // Fetch the last fournisseur based on the generated ID pattern
  const lastFournisseur = await prisma.fournisseur.findMany({
    where: {
      id_fournisseur: {
        startsWith: `FRN-${year}${month}`,
      },
    },
    orderBy: {
      id_fournisseur: "desc",
    },
    take: 1,
  });

  let increment = 1;
  if (lastFournisseur.length > 0) {
    console.log(
      "Last Fournisseur : ",
      JSON.stringify(lastFournisseur, null, 4)
    );
    const lastId = lastFournisseur[0].id_fournisseur;
    const lastIncrement = parseInt(lastId.slice(-4), 10);
    increment = lastIncrement + 1;
  }

  return `FRN-${year}${month}-${String(increment).padStart(4, "0")}`;
};

// GET function to retrieve fournisseur data
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
  // Handle GET requests to fetch fournisseur data
  if (req.method === "GET") {
    const {
      page = 1,
      limit = 10,
      search = [],
      sortBy = "nom",
      sortOrder = "asc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const sortFields = ["nom", "prenom", "email", "tel"];
    const order = sortOrder === "desc" ? "desc" : "asc";

    // Validate pagination parameters
    if (
      isNaN(pageNumber) ||
      isNaN(pageSize) ||
      pageNumber < 1 ||
      pageSize < 1
    ) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    // Validate sorting parameters
    if (!sortFields.includes(sortBy as string)) {
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }

    try {
      let searchTerms = Array.isArray(search) ? search : [search];
      searchTerms = searchTerms
        .map((term) => String(term).trim())
        .filter((term) => term.length > 0);

      // Construct dynamic filter based on search query
      let filters = {};
      if (searchTerms.length > 0) {
        filters = {
          OR: searchTerms.map((term) => ({
            OR: [
              { nom: { contains: term } },
              { prenom: { contains: term } },
              { email: { contains: term } },
              { tel: { contains: term } },
            ],
          })),
        };
      }

      // Fetch paginated fournisseurs data from the database
      const fournisseurs = await prisma.fournisseur.findMany({
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      });

      // Count the total number of fournisseurs for pagination metadata
      const totalFournisseurs = await prisma.fournisseur.count({
        where: filters,
      });
      const totalPages = Math.ceil(totalFournisseurs / pageSize);

      // Return the data and pagination meta-information
      return res.status(200).json({
        data: fournisseurs,
        meta: {
          totalFournisseurs,
          totalPages,
          currentPage: pageNumber,
          pageSize,
        },
      });
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 4));
      //console.log("Last Fournisseur : ", JSON.stringify(lastFournisseur, null, 4));
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  // POST function to create a new fournisseur
  else if (req.method === "POST") {
    const { nom, prenom, email, tel } = req.body;
    //console.log("req.body : ", JSON.stringify(req.body, null, 4));

    // Validate if all required fields are provided
    if (!nom || !prenom || !email || !tel) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Generate the id_fournisseur using the generateFournisseurId function
      const id_fournisseur = await generateFournisseurId();
      console.log("Generated id_fournisseur:", id_fournisseur);

      // Create new fournisseur in the database
      const newFournisseur = await prisma.fournisseur.create({
        data: {
          id_fournisseur,
          nom,
          prenom,
          email,
          tel,
        },
      });

      console.log(
        "New Fournisseur : ",
        JSON.stringify(newFournisseur, null, 4)
      );

      // Return the newly created fournisseur with the auto-generated ID
      return res.status(201).json(newFournisseur);
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 4));
      return res.status(500).json({ error: "Failed to create fournisseur" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
