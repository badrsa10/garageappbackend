import { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../lib/prisma'; 

// Function to generate a unique client ID
const generateClientId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const lastClient = await prisma.client.findMany({
    where: {
      id_client: {
        startsWith: `CLT-${year}${month}`,
      },
    },

    orderBy: {
      id_client: "desc",
    },
    take: 1,
  });

  let increment = 1;
  if (lastClient.length > 0) {
    const lastId = lastClient[0].id_client;
    const lastIncrement = parseInt(lastId.slice(-4), 10);
    increment = lastIncrement + 1;
  }

  return `CLT-${year}${month}-${String(increment).padStart(4, "0")}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //GET
  if (req.method === "GET") {

    const { page = 1, limit = 10, search = [], sortBy = "nom", sortOrder = "asc" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const sortFields = ["nom", "prenom", "email", "type_personne"];
    const order = sortOrder === "desc" ? "desc" : "asc";

    if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    if (!sortFields.includes(sortBy as string)) {
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }

    try {
      let searchTerm = Array.isArray(search) ? search : search ? [search] : [];

      //console.log(search);
      //console.log(searchTerm);
      searchTerm = searchTerm
        .map((term) => String(term).trim())
        .filter((term) => term.length > 0);

      let filters = {};

      if (searchTerm.length > 0) {
        filters = {
          OR: searchTerm.map((term) => ({
            OR: [
              { nom: { contains: term } },
              { prenom: { contains: term } },
              { email: { contains: term } },
            ],
          })),
        };
      }
      //const whereCondition = Object.keys(filters).length > 0 ? filters : undefined;

      console.log("Final filters:", JSON.stringify(filters, null, 2));


      const clients = await prisma.client.findMany({
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        //include: { vehicule: true },
      });

      console.log("Clients found:", clients);

      const totalClients = await prisma.client.count({ where: filters });
      console.log("totalClients: ",totalClients);
      const totalPages = Math.ceil(totalClients / pageSize);
      console.log("totalPages: ",totalPages);
      return res.status(200).json({
        data: clients,
        meta: {
          totalClients,
          totalPages,
          currentPage: pageNumber,
          pageSize,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }
  //POST
  else if (req.method === "POST") {
    const { nom, prenom, email, tel, type_personne, vehiculeId } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !tel || !type_personne) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const id_client = await generateClientId();

      // Create a new client with an optional vehicle association
      const newClient = await prisma.client.create({
        data: {
          id_client,
          nom,
          prenom,
          email,
          tel,
          type_personne,
          vehiculeId: vehiculeId || null, // Associate the client with a vehicle, if provided
        },
      });

      return res.status(201).json(newClient);
    } catch (error) {
      //console.log(error);
      return res.status(500).json({ error: "Failed to create client" });
    }
  } else {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
