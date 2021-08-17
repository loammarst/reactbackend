const echutterController = require("../Controllers/echutter.controller");
module.exports = (app) => {
  app.post("/api/sendWorkToEchutter", echutterController.save);
  app.post("/api/clearEchutter", echutterController.clearEchutter);
  app.get("/api/getWorkToEchutterTable", echutterController.getData);
  app.put("/api/onTriggerGood", echutterController.onTriggerGood);
  app.put("/api/onTriggerNonGood", echutterController.onTriggerNonGood);
};
