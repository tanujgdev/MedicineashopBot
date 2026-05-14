const { Pool } = require("pg");

const db = new Pool({

  connectionString:
    process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  max: 20,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 10000,
});

// ==========================
// CONNECT
// ==========================

db.connect()

  .then(() => {

    console.log(
      "✅ PostgreSQL Connected"
    );
  })

  .catch((err) => {

    console.log(
      "❌ DB Connection Error"
    );

    console.log(err.message);
  });

// ==========================
// ERROR HANDLER
// ==========================

db.on("error", (err) => {

  console.log(
    "❌ PostgreSQL Pool Error"
  );

  console.log(err.message);
});

module.exports = db;
