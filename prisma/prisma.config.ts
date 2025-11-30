export default {
  datasources: {
    db: {
      adapter: {
        url: process.env.DATABASE_URL, // ta connexion Postgres
      },
      // ou accelerateUrl: process.env.ACCELERATE_URL si tu utilises Accelerate
    },
  },
};
