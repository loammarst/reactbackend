const echutterModel = require("../Models/echutter.model");
exports.save = async (req, res) => {
  const message = await echutterModel.saveEchutterToDatabase(req.body);
  res.send(message);
};
exports.getData = async (_, res) => {
  const message = await echutterModel.getEchutterFromDatabase();
  res.send(message);
};
exports.onTriggerGood = async (_, res) => {
  try {
    const message = await echutterModel.onTriggerGood();
    res.send(message);
  } catch (err) {
    res.status(503).send(err);
  }
};
exports.onTriggerNonGood = async (req, res) => {
  try {
    const message = await echutterModel.onTriggerNonGood(req.body);
    res.send(message);
  } catch (err) {
    res.status(503).send(err);
  }
};
exports.clearEchutter = async (req, res) => {
  try {
    const message = await echutterModel.clearEchutter();
    res.send(message);
  } catch (err) {
    res.status(503).send(err);
  }
};
