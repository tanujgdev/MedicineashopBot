const db =
  require("../config/db");

// ==========================
// ADD
// ==========================

async function addMedicine(
  data
) {

  const {

    name,
    stock,
    price,
    company,
    expiry,

  } = data;

  return await db.query(

    `INSERT INTO medicines
    (name, stock, price, company, expiry)

    VALUES ($1,$2,$3,$4,$5)`,

    [
      name,
      stock,
      price,
      company,
      expiry,
    ]
  );
}

// ==========================
// UPDATE
// ==========================

async function updateStock(
  name,
  stock
) {

  return await db.query(

    `UPDATE medicines

     SET stock=$1

     WHERE name=$2`,

    [stock, name]
  );
}

// ==========================
// DELETE
// ==========================

async function deleteMedicine(
  name
) {

  return await db.query(

    `DELETE FROM medicines
     WHERE name=$1`,

    [name]
  );
}

// ==========================
// STOCK
// ==========================

async function getStock() {

  return await db.query(

    `SELECT *
     FROM medicines

     ORDER BY id DESC

     LIMIT 20`
  );
}

// ==========================
// SEARCH
// ==========================

async function searchMedicine(
  keyword
) {

  return await db.query(

    `SELECT *
     FROM medicines

     WHERE LOWER(name)

     LIKE LOWER($1)`,

    [`%${keyword}%`]
  );
}

async function deleteAll() {

  return await db.query(

`TRUNCATE TABLE medicines
RESTART IDENTITY`
  );
}


module.exports = {

  addMedicine,

  updateStock,

  deleteMedicine,

  deleteAll,
  
  getStock,

  searchMedicine,
};
