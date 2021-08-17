const connectDatabase = require("./Utils/db.util");
const express = require("express");
const app = express();
const { promisify } = require("util");
const fs = require("fs");
const { socketConnection } = require("./Utils/socket.io.util");
const cors = require("cors");
const imageDirectory = "./Public/Images";
let imageList = [];
fs.readdir(imageDirectory, (err, file) => {
  if (err) console.log(err);
  file.forEach((file) => {
    imageList.push(file);
  });
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.get("/img/:id", (req, res) => {
  let image;
  try {
    image = fs.readFileSync(
      "./Public/Images/" +
        imageList[imageList.findIndex((item) => item === req.params.id)]
    );
  } catch (err) {
    image = fs.readFileSync("./Public/Images/NoImg.png");
  }
  res.writeHead(200, { "Content-Type": "image/gif" });
  res.end(image, "binary");
});
require("./Routes/echutter.route")(app);
require("./Routes/performance.analysis.route")(app);
app.use("*", (_, res) => {
  res.status(200).send({ message: "Not Found API!" });
});

const server = app.listen(process.env.PORT || 3001, () => {
  console.log(`Start server at port ${process.env.PORT || 3001}.`);
});
socketConnection(server);
