const performanceAnalysisController = require("../Controllers/performance.analysis.controller");
module.exports = (app) => {
  /*-----------------Performance Analysis API----------------------- */
  app.post(
    "/api/performanceAnalysisSetting",
    performanceAnalysisController.save
  );
  app.get(
    "/api/performanceAnalysisSetting",
    performanceAnalysisController.getData
  );
};
