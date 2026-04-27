const { pool } = require("./src/config/db");

pool.query("SELECT NOW()")
  .then(res => {
    console.log("DB Connected:", res.rows);
  })
  .catch(err => {
    console.error("DB Error:", err);
  });