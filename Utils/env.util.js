const env = {
  database: "tps_chi_dev",
  username: "root",
  password: "",
  host: "localhost",
  dialect: "mysql",
  port: 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 1000000,
  },
};

module.exports = env;
