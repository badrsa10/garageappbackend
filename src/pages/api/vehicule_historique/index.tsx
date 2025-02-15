import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET
  if (req.method === "GET") {
    const { page = 1, limit = 10, search = [], sortBy = "date_historique", sortOrder = "asc" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const sortFields = ["date_historique", "libelle_service", "serviceId", "vehiculeId"];
    const order = sortOrder === "desc" ? "desc" : "asc";

    if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    if (!sortFields.includes(sortBy as string)) {
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }

    try {
      let searchTerms = Array.isArray(search) ? search : [search];
      searchTerms = searchTerms.map((term) => String(term).trim()).filter((term) => term.length > 0);

      let filters = {};
      if (searchTerms.length > 0) {
        filters = {
          OR: searchTerms.map((term) => ({
            OR: [
              { libelle_service: { contains: term} },
              { serviceId: { contains: term} },
              { vehiculeId: { contains: term} },
            ],
          })),
        };
      }
      

      const historiques = await prisma.vehiculeHistorique.findMany({
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      });

      const totalHistoriques = await prisma.vehiculeHistorique.count({ where: filters });
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
  }
  // POST
  else if (req.method === "POST") {
    const { vehiculeId, date_historique, serviceId, libelle_service } = req.body;
    console.log("req.body : ",JSON.stringify(req.body, null, 4));

    if (!vehiculeId || !date_historique || !serviceId || !libelle_service) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const id_vehicule_historique = await generateHistoriqueId();
      console.log("id_vehicule_historique ",id_vehicule_historique);
      console.log("vehiculeId ",vehiculeId);
      console.log("date_historique ",new Date(date_historique));
      console.log("serviceId ",serviceId);
      console.log("libelle_service ",libelle_service);
      //Create
      const newHistorique = await prisma.vehiculeHistorique.create({
        data: {
          id_vehicule_historique,
          vehiculeId,
          date_historique : new Date(date_historique),
          serviceId,
          libelle_service,
        },
      });
      console.log(" NewHistorique : ",JSON.stringify(newHistorique, null, 4));
      return res.status(201).json(newHistorique);
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 4));
      return res.status(500).json({ error: "Failed to create historique" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
