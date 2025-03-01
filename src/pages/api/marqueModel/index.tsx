import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// Function to handle API requests for marque models
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '10', search = '', sortBy = 'marque', sortOrder = 'asc' } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);
  const order = sortOrder === 'desc' ? 'desc' : 'asc';

  // Validate pagination parameters
  if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  // Validate sorting parameters
  const sortFields = ['marque', 'model'];
  if (!sortFields.includes(sortBy as string)) {
    return res.status(400).json({ error: 'Invalid sortBy parameter' });
  }

  // Handle GET request to fetch marque model data
  if (req.method === 'GET') {
    try {
      // Construct dynamic filter based on search query
      const filters = search ? {
        OR: [
          { marque: { contains: String(search) } },
          { model: { contains: String(search) } },
        ],
      } : {};

      // Fetch paginated marque model data from the database
      const marques = await prisma.marqueModel.findMany({
        where: filters,
        orderBy: { [sortBy as string]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      });

      // Count the total number of marque models for pagination metadata
      const totalMarques = await prisma.marqueModel.count({ where: filters });
      const totalPages = Math.ceil(totalMarques / pageSize);

      // Return the data and pagination meta-information
      return res.status(200).json({
        data: marques,
        meta: {
          totalMarques,
          totalPages,
          currentPage: pageNumber,
          pageSize,
        },
      });
    } catch (error) {
      console.error('Error fetching marque models:', JSON.stringify(error,null,2));
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  // Handle POST request to create a new marque model
  else if (req.method === 'POST') {
    const { marque, model } = req.body;

    // Validate if the required fields are provided
    if (!marque || !model) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newMarqueModel = await prisma.marqueModel.create({
        data: {
          marque,
          model,
        },
      });
      return res.status(201).json(newMarqueModel);
    } catch (error) {
      console.error('Error creating marque model:', error);
      return res.status(500).json({ error: 'Failed to create marque model' });
    }
  }

  else {
    return res.status(405).end(); // Method Not Allowed
  }
}
