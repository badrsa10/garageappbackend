import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/lib/prisma";
import { Prisma } from "@prisma/client";

const generateVehiculeId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const lastVehicule = await prisma.vehicule.findMany({
    where: {
      id_vehicule: {
        startsWith: `VEH-${year}${month}`,
      },
    },
    orderBy: {
      id_vehicule: "desc",
    },
    take: 1,
  });

  let increment = 1;
  if (lastVehicule.length > 0) {
    const lastId = lastVehicule[0].id_vehicule;
    const lastIncrement = parseInt(lastId.slice(-4));
    increment = lastIncrement + 1;
  }

  return `VEH-${year}${month}-${String(increment).padStart(4, "0")}`;
};

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
  // GET
  if (req.method === "GET") {
    /*const { page = 1, limit = 10, search = [], sortBy = 'marque', sortOrder = 'asc' } = req.query;

    console.log(req.query);
    const searchTerm = Array.isArray(search) ? search : [search];
    console.log(typeof searchTerm);
    return res.status(200).json({ error: 'wakha 3la mok' });*/

    const {
      page = 1,
      limit = 10,
      search = [],
      sortBy = "marque",
      sortOrder = "asc",
      clientId,
    } = req.query;

    //console.log(req.query);
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    //const searchTerm = search ? (Array.isArray(search) ? search.join(" ") : String(search)) : '';
    //console.log(search);
    const sortFields = [
      "marque",
      "modele",
      "annee",
      "kilometrage",
      "matricule",
      "numeroSerie",
    ];
    const order = sortOrder === "desc" ? "desc" : "asc";

    if (
      isNaN(pageNumber) ||
      isNaN(pageSize) ||
      pageNumber < 1 ||
      pageSize < 1
    ) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    if (!sortFields.includes(sortBy as string)) {
      console.log("sort field ", sortBy);
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }
    try {
      // **Parse and Clean Up 'search' Parameter**
      let searchTerms = Array.isArray(search) ? search : [search];

      // Ensure all terms are strings and trim whitespace
      searchTerms = searchTerms
        .map((term) => String(term).trim())
        .filter((term) => term.length > 0);

      // **Build Prisma Filters**
      let filters: Prisma.VehiculeWhereInput = {};

      const andConditions: Prisma.VehiculeWhereInput[] = [];

      if (clientId) {
        andConditions.push({ clientId: String(clientId) });
      }

      if (searchTerms.length > 0) {
        andConditions.push({
          OR: searchTerms.map((term) => ({
            OR: [
              { marque: { contains: term, mode: "insensitive" } },
              { modele: { contains: term, mode: "insensitive" } },
              { matricule: { contains: term, mode: "insensitive" } },
              { numeroSerie: { contains: term, mode: "insensitive" } },
              { clientId: { contains: term, mode: "insensitive" } },
            ],
          })),
        });
      }

      if (andConditions.length > 0) {
        filters.AND = andConditions;
      }

      console.log("Final filters:", JSON.stringify(filters, null, 2));
      //console.log(JSON.stringify(filters, null, 4));
      //console.log(new Date());
      const vehicules = await prisma.vehicule.findMany({
        //where: { OR: [{ marque: String("Audi") }, { marque: String("Kia") }] },
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: { client: true },
      });

      console.log(JSON.stringify(vehicules, null, 4));

      const totalVehicules = await prisma.vehicule.count({ where: filters });
      //console.log(totalVehicules);
      const totalPages = Math.ceil(totalVehicules / pageSize);
      //console.log(totalPages);
      return res.status(200).json({
        data: vehicules,
        meta: {
          totalVehicules,
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
  // POST
  else if (req.method === "POST") {
    const {
      marque,
      modele,
      annee,
      kilometrage,
      matricule,
      numeroSerie,
      clientId,
    } = req.body;

    if (
      !marque ||
      !modele ||
      !annee ||
      !kilometrage ||
      !matricule ||
      !numeroSerie
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      console.log("req.body:", JSON.stringify(req.body, null, 2));
      // 🔍 Check if marque + modele exists in marqueModel table
      const exists = await prisma.marqueModel.findFirst({
        where: {
          marque: { equals: marque, mode: Prisma.QueryMode.insensitive },
          model: { equals: modele, mode: Prisma.QueryMode.insensitive },
        },
      });

      if (!exists) {
        return res.status(400).json({
          error:
            "Marque and modele combination does not exist in marqueModel table",
        });
      }

      const id_vehicule = await generateVehiculeId();

      const newVehicule = await prisma.vehicule.create({
        data: {
          id_vehicule,
          marque,
          modele,
          annee: Number(annee),
          kilometrage: Number(kilometrage),
          matricule,
          numeroSerie,
          clientId: clientId && typeof clientId === "string" ? clientId : null,
        },
      });
      console.log("newVehicule:", JSON.stringify(newVehicule, null, 2));
      return res.status(201).json(newVehicule);
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to create vehicle" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
