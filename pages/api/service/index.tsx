import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/lib/prisma";

// Function to generate the service id
const generateServiceId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // Fetch the last service based on the generated ID pattern
  const lastService = await prisma.service.findMany({
    where: {
      id_service: {
        startsWith: `SRV-${year}${month}`,
      },
    },
    orderBy: {
      id_service: "desc",
    },
    take: 1,
  });

  let increment = 1;
  if (lastService.length > 0) {
    const lastId = lastService[0].id_service;
    const lastIncrement = parseInt(lastId.slice(-4), 10);
    increment = lastIncrement + 1;
  }

  return `SRV-${year}${month}-${String(increment).padStart(4, "0")}`;
};

// Function to handle API requests for services
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
  // Handle GET requests to fetch service data with pagination and filters
  else if (req.method === "GET") {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "libelle",
      sortOrder = "asc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const sortFields = ["libelle"];
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
      // Construct dynamic filter based on search query
      const filters = search
        ? {
            libelle: {
              contains: String(search),
            },
          }
        : {};

      // Fetch paginated service data from the database
      const services = await prisma.service.findMany({
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      });

      // Count the total number of services for pagination metadata
      const totalServices = await prisma.service.count({ where: filters });
      const totalPages = Math.ceil(totalServices / pageSize);

      // Return the data and pagination meta-information
      return res.status(200).json({
        data: services,
        meta: {
          totalServices,
          totalPages,
          currentPage: pageNumber,
          pageSize,
        },
      });
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 2));
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  // Handle POST requests to create a new service
  else if (req.method === "POST") {
    const { libelle } = req.body;

    // Validate if the required field is provided
    if (!libelle) {
      return res
        .status(400)
        .json({ error: "Missing required field 'libelle'" });
    }

    try {
      // Generate the service id using the generateServiceId function
      const id_service = await generateServiceId();
      console.log("Generated id_service:", id_service);

      // Create a new service in the database
      const newService = await prisma.service.create({
        data: {
          id_service,
          libelle,
        },
      });

      // Return the newly created service
      return res.status(201).json(newService);
    } catch (error) {
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to create service" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
