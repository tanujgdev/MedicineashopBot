const XLSX = require("xlsx");

const fs = require("fs");

const db =
  require("../config/db");

async function processExcel(
  path
) {

  try {

    const workbook =
      XLSX.readFile(path);

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const data =
      XLSX.utils.sheet_to_json(sheet);

    let success = 0;

    // ==========================
    // SINGLE CLIENT
    // ==========================

    const client =
      await db.connect();

    try {

      await client.query("BEGIN");

      for (const row of data) {

        try {

          await client.query(

`INSERT INTO medicines
(name, stock, price, company, expiry)

VALUES ($1,$2,$3,$4,$5)

ON CONFLICT (name)
DO NOTHING`,

            [
              row.name,
              row.stock,
              row.price,
              row.company,
              row.expiry,
            ]
          );

          success++;

        } catch (err) {

          console.log(
            "Insert Error:"
          );

          console.log(
            err.message
          );
        }
      }

      await client.query(
        "COMMIT"
      );

    } catch (err) {

      await client.query(
        "ROLLBACK"
      );

      console.log(err);

    } finally {

      client.release();
    }

    fs.unlinkSync(path);

    return success;

  } catch (err) {

    console.log(
      "Excel Error:"
    );

    console.log(err.message);

    return 0;
  }
}

module.exports =
  processExcel;
