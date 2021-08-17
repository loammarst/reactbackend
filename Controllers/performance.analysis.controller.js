const performanceAnalysisModel = require("../Models/performance.analysis.model");
exports.save = async (req, res) => {
  const message = await performanceAnalysisModel.saveToDatabase(req.body);
  res.send(message);
};

exports.getData = async (_, res) => {
  const data = await performanceAnalysisModel.getDataFromDatabase();
  res.send(data);
};
