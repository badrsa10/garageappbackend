import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/lib/prisma";

// Function to generate the id_piece
const generatePieceId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // Fetch the last piece based on the generated ID pattern
  const lastPiece = await prisma.piece.findMany({
    where: {
      id_piece: {
        startsWith: `PIC-${year}${month}`,
      },
    },
    orderBy: {
      id_piece: "desc",
    },
    take: 1,
  });

  let increment = 1;
  if (lastPiece.length > 0) {
    const lastId = lastPiece[0].id_piece;
    const lastIncrement = parseInt(lastId.slice(-4), 10);
    increment = lastIncrement + 1;
  }

  return `PIC-${year}${month}-${String(increment).padStart(4, "0")}`;
};

// GET function to retrieve piece data
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
  // Handle GET requests to fetch piece data
  else if (req.method === "GET") {
    const {
      page = 1,
      limit = 10,
      search = [],
      sortBy = "libelle",
      sortOrder = "asc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const sortFields = ["libelle", "quantite"];
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
            OR: [{ libelle: { contains: term } }],
          })),
        };
      }

      // Fetch paginated piece data from the database
      const pieces = await prisma.piece.findMany({
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      });

      // Count the total number of pieces for pagination metadata
      const totalPieces = await prisma.piece.count({ where: filters });
      const totalPages = Math.ceil(totalPieces / pageSize);

      // Return the data and pagination meta-information
      return res.status(200).json({
        data: pieces,
        meta: {
          totalPieces,
          totalPages,
          currentPage: pageNumber,
          pageSize,
        },
      });
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 4));
      console.log("Error details:", JSON.stringify(error, null, 4));
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  // POST function to create a new piece
  else if (req.method === "POST") {
    const { libelle, quantite } = req.body;
    console.log("req.body : ", JSON.stringify(req.body, null, 4));

    // Validate if all required fields are provided
    if (!libelle || !quantite) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // ✅ Check if a piece with the same libelle already exists (case-insensitive)
      const existingPiece = await prisma.piece.findFirst({
        where: {
          libelle: {
            equals: libelle,
            mode: "insensitive", // ignores case
          },
        },
      });

      if (existingPiece) {
        return res
          .status(409)
          .json({ error: "A piece with this libelle already exists" });
      }

      // Generate the id_piece using the generatePieceId function
      const id_piece = await generatePieceId();
      console.log("Generated id_piece:", id_piece);

      // Create new piece in the database
      const newPiece = await prisma.piece.create({
        data: {
          id_piece,
          libelle,
          quantite,
        },
      });

      console.log("New Piece : ", JSON.stringify(newPiece, null, 4));

      // Return the newly created piece with the auto-generated ID
      return res.status(201).json(newPiece);
    } catch (error) {
      console.error("Error details:", JSON.stringify(error, null, 4));
      return res.status(500).json({ error: "Failed to create piece" });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
