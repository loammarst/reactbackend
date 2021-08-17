const mysql2 = require("mysql2/promise");

async function connectDatabase() {
  try {
    const createConnection = await mysql2.createConnection({
      host: "localhost", //localhost
      port: 3306,
      user: "root", //root
      password: "", //
      database: "tps_chi_dev",
      connectionLimit: 500000,
    });
    return createConnection;
  } catch (error) {
    console.log("เกิดข้อผิดพลาดที่ไฟล์ Utils/db.util.js log is: " + error);
  }
}
module.exports = connectDatabase;
