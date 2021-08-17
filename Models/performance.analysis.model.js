const connectDatabase = require("../Utils/db.util");
const { sendMessageWithKey } = require("../Utils/socket.io.util");
exports.getDataFromDatabase = () => {
  return new Promise(async (resolve) => {
    const sql = await connectDatabase();
    const commandSelectSetupPerformanceAnalysis = `SELECT date,lineName,operatorName,orderPerDay,taktTimeLine,STDCycleTime,normalWorkingTime,overTime FROM setup_performance_analysis`;
    const commandSelectSetupProductionTime = `SELECT typeShift,timeStart,timeEnd,timePlanMin,(SELECT COUNT(*) FROM e_chutter WHERE date_finish_work >= timeStart AND date_finish_work < timeEnd AND fail_code = 0) AS timeActualPlan,(SELECT COUNT(*) FROM e_chutter WHERE date_finish_work >= timeStart AND date_finish_work < timeEnd AND fail_code != 0) AS defect  FROM setup_production_time `;

    const [rowPerformanceAnalysis] = await sql.query(
      commandSelectSetupPerformanceAnalysis
    );
    console.log(rowPerformanceAnalysis);
    const [rowProductionTime] = await sql.query(
      commandSelectSetupProductionTime
    );

    let data = {};
    data = { defaultSetting: rowPerformanceAnalysis[0] };

    data.defaultSetting.planTimeSettingFirstShift = rowProductionTime.filter(
      (item) => item.typeShift !== "SecondShift"
    );
    data.defaultSetting.planTimeSettingSecondShift = rowProductionTime.filter(
      (item) => item.typeShift !== "FirstShift"
    );

    resolve(data);
  });
};

exports.saveToDatabase = async ({ defaultSetting }) => {
  timeOverflow = false;
  return new Promise(async (resolve) => {
    const sql = await connectDatabase();

    const date = defaultSetting.date.split("/");
    const { year, month, day } = {
      year: parseInt(date[2]),
      month: parseInt(date[1]) - 1,
      day: parseInt(date[0]),
    };
    const commandTruncatePerformanceSetting = `TRUNCATE TABLE setup_performance_analysis`;
    const commandInsertPerformanceSetting = `INSERT INTO setup_performance_analysis (date,lineName,operatorName,orderPerDay,taktTimeLine,STDCycleTime,normalWorkingTime,overTime) VALUES (?,?,?,?,?,?,?,?)`;
    const commandTruncateSetupProductionTime = `TRUNCATE TABLE setup_production_time`;
    const commandInsertFirstShift = `INSERT INTO setup_production_time (typeShift,timeStart,timeEnd,timePlanMin) VALUES ('FirstShift',?,?,?)`;
    const commandInsertSecondShift = `INSERT INTO setup_production_time (typeShift,timeStart,timeEnd,timePlanMin) VALUES ('SecondShift',?,?,?)`;
    try {
      await sql.beginTransaction();

      await sql.query(commandTruncatePerformanceSetting);

      await sql.query(commandInsertPerformanceSetting, [
        new Date(year, month, day),
        defaultSetting.lineName,
        defaultSetting.operatorName,
        defaultSetting.orderPerDay,
        defaultSetting.taktTimeLine,
        defaultSetting.STDCycleTime,
        defaultSetting.normalWorkingTime,
        defaultSetting.overTime,
      ]);

      await sql.query(commandTruncateSetupProductionTime);
      defaultSetting.planTimeSettingFirstShift.map(async (item) => {
        let timeStartHours = parseInt(item.timeStart.split(".")[0]);
        let timeStartMinute = parseInt(item.timeStart.split(".")[1]);
        let timeEndHours = parseInt(item.timeEnd.split(".")[0]);
        let timeEndMinute = parseInt(item.timeEnd.split(".")[1]);
        if (timeEndHours === 0) timeOverflow = true;
        await sql.query(commandInsertFirstShift, [
          timeOverflow === true
            ? new Date(year, month, day + 1, timeStartHours, timeStartMinute)
            : new Date(year, month, day, timeStartHours, timeStartMinute),
          timeOverflow === true
            ? new Date(year, month, day + 1, timeEndHours, timeEndMinute)
            : new Date(year, month, day, timeEndHours, timeEndMinute),
          item.timePlanMin,
        ]);
      });
      defaultSetting.planTimeSettingSecondShift.map(async (item) => {
        let timeStartHours = parseInt(item.timeStart.split(".")[0]);
        let timeStartMinute = parseInt(item.timeStart.split(".")[1]);
        let timeEndHours = parseInt(item.timeEnd.split(".")[0]);
        let timeEndMinute = parseInt(item.timeEnd.split(".")[1]);
        if (timeEndHours === 0) timeOverflow = true;
        await sql.query(commandInsertSecondShift, [
          timeOverflow === true
            ? timeStartHours === 23
              ? new Date(year, month, day, timeStartHours, timeStartMinute)
              : new Date(year, month, day + 1, timeStartHours, timeStartMinute)
            : new Date(year, month, day, timeStartHours, timeStartMinute),
          timeOverflow === true
            ? new Date(year, month, day + 1, timeEndHours, timeEndMinute)
            : new Date(year, month, day, timeEndHours, timeEndMinute),
          item.timePlanMin,
        ]);
      });
      await sql.commit();
    } catch (error) {
      console.log(error);
    }
    sendMessageWithKey(
      "receive_signal_update_echutter",
      "server_force_to_load_echutter"
    );
    resolve({ message: "success" });
  });
};
