// import { NextApiRequest, NextApiResponse } from "next";
// import prisma from "../../../lib/prisma";

// // Generate a unique id_commande
// const generateCommandeId = async () => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0");

//   const lastCommande = await prisma.commande.findMany({
//     where: {
//       id_commande: {
//         startsWith: `CMD-${year}${month}`,
//       },
//     },
//     orderBy: {
//       id_commande: "desc",
//     },
//     take: 1,
//   });

//   let increment = 1;
//   if (lastCommande.length > 0) {
//     const lastId = lastCommande[0].id_commande;
//     const lastIncrement = parseInt(lastId.slice(-4), 10);
//     increment = lastIncrement + 1;
//   }

//   return `CMD-${year}${month}-${String(increment).padStart(4, "0")}`;
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "GET") {
//     const {
//       page = 1,
//       limit = 10,
//       search = [],
//       sortBy = "etat",
//       sortOrder = "asc",
//     } = req.query;

//     const pageNumber = parseInt(page as string, 10);
//     const pageSize = parseInt(limit as string, 10);
//     const validSortFields = ["etat", "createdAt", "updatedAt"];
//     const order = sortOrder === "desc" ? "desc" : "asc";

//     if (
//       isNaN(pageNumber) ||
//       isNaN(pageSize) ||
//       pageNumber < 1 ||
//       pageSize < 1
//     ) {
//       return res.status(400).json({ error: "Invalid pagination parameters" });
//     }

//     if (!validSortFields.includes(sortBy as string)) {
//       return res.status(400).json({ error: "Invalid sortBy parameter" });
//     }

//     try {
//       let searchTerms = Array.isArray(search) ? search : [search];
//       searchTerms = searchTerms
//         .map((term) => String(term).trim())
//         .filter((term) => term.length > 0);

//       let filters = {};
      

//       console.log("filters : ",JSON.stringify(filters, null, 4));
//       console.log("order : ",JSON.stringify(order, null, 4));
//       console.log("pageNumber : ",JSON.stringify(pageNumber, null, 4));
//       console.log("pageSize : ",JSON.stringify(pageSize, null, 4));
//       console.log("time : ",JSON.stringify(new Date(), null, 4));
//       const totalCommandes = await prisma.commande.findMany({ where: filters });
//       console.log("totalCommandes : ",JSON.stringify(totalCommandes, null, 4));
//       //const commandes = await prisma.commande.findMany({
//         //where: {},
//         //orderBy: { [sortBy as string]: order },
//         //skip: (pageNumber - 1) * pageSize,
//         //take: pageSize,
//         //include: {
//           //fournisseur: true,
//           //lines: true,
//         //},
//       //});
//       //console.log("commandes : ",JSON.stringify(commandes, null, 4));

//       //const totalCommandes = await prisma.commande.count({ where: filters });
//       //console.log("totalCommandes : ",JSON.stringify(totalCommandes, null, 4));
//       const totalPages = Math.ceil(totalCommandes / pageSize);
//       console.log("totalPages : ",JSON.stringify(totalPages, null, 4));

//       // return res.status(200).json({
//       //   data: commandes,
//       //   meta: {
//       //     totalCommandes,
//       //     totalPages,
//       //     currentPage: pageNumber,
//       //     pageSize,
//       //   },
//       // });
//     } catch (error) {
      
//       console.error("Error fetching commandes:", JSON.stringify(error, null, 4));
      
//       return res.status(500).json({ error: "Something went wrong" });
//     }
//   }

//   if (req.method === "POST") {
//     const { fournisseurId, etat, lines } = req.body;

//     if (
//       !fournisseurId ||
//       !etat ||
//       !Array.isArray(lines) ||
//       lines.length === 0
//     ) {
//       return res
//         .status(400)
//         .json({ error: "Missing required fields or invalid lines" });
//     }

//     try {
//       const id_commande = await generateCommandeId();

//       const newCommande = await prisma.commande.create({
//         data: {
//           id_commande,
//           fournisseurId,
//           etat,
//           lines: {
//             create: lines.map((line) => ({
//               pieceId: line.pieceId,
//               quantite: line.quantite,
//               prix_unite: line.prix_unite,
//               prix_total: line.quantite * line.prix_unite,
//             })),
//           },
//         },
//         include: {
//           fournisseur: true,
//           lines: true,
//         },
//       });

//       return res.status(201).json(newCommande);
//     } catch (error) {
//       console.error("Error creating commande:", error);
//       return res.status(500).json({ error: "Failed to create commande" });
//     }
//   }

//   return res.status(405).json({ error: "Method Not Allowed" });
// }
