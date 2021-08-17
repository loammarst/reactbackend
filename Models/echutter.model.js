const { reject } = require("bluebird");
const connectDatabase = require("../Utils/db.util");
const { sendMessageWithKey } = require("../Utils/socket.io.util");
/*ฟังก์ชั่นสำหรับจำลองการส่งข้อมูลมาจากฝั่งอาจารย์ปายโดยจะทำการส่ง pd_code มา */
exports.saveEchutterToDatabase = function ({ pd_code }) {
  return new Promise(async (resolve) => {
    const sql = await connectDatabase();
    try {
      await sql.query(
        "INSERT INTO e_chutter (pd_code,status,timestamp,date_from_sender,date_finish_work,delay,fail_code) VALUE (?,'Waiting',UNIX_TIMESTAMP(NOW(4)),NOW(),'0000-00-00 00:00:00',0,0)",
        [pd_code]
      );
    } catch (error) {
      console.log(
        "เกิดข้อผิดพลาดที่ไฟล์ Models/echutter.model.js ที่ฟังก์ชั่น saveEchutterToDatabase log is: " +
          error
      );
    }
    sendMessageWithKey(
      "receive_signal_update_echutter",
      "server_force_to_load_echutter"
    );
    resolve({ message: "success" });
  });
};
exports.onTriggerGood = function () {
  return new Promise(async (resolve, reject) => {
    sql = await connectDatabase();
    await sql.beginTransaction();

    commandSelectTimeFirst = `SELECT timeStart,timeEnd FROM setup_production_time LIMIT 1`;
    commandSelectAllTime = `SELECT typeShift,timeStart,timeEnd FROM setup_production_time`;
    commandSelectWaitingLastest = `SELECT pd_code,timestamp FROM e_chutter WHERE status = 'Waiting' LIMIT 1`;
    commandComplete = `UPDATE e_chutter SET status='Complete' ,date_finish_work=NOW() WHERE pd_code = ? AND timestamp = ?`;
    commandDelay = `UPDATE e_chutter SET status='Delay' ,date_finish_work=NOW(),delay = 1 WHERE pd_code = ? AND timestamp = ?`;
    commandSumWorkAllBefore = `SELECT COUNT(*) AS SUM FROM e_chutter WHERE date_finish_work != '0000-00-00 00:00:00' AND date_finish_work >= ?`;
    commandSelectPlanPartAllBefore = `SELECT SUM(timePlanMin) AS SUM FROM setup_production_time WHERE timeStart >= ? AND timeEnd <= ?`;
    const [rowTimeFirst] = await sql.query(commandSelectTimeFirst);
    const [rowWaitingLastest] = await sql.query(commandSelectWaitingLastest);
    if (rowWaitingLastest.length === 0)
      reject({ message: "ไม่พบข้อมูลในช่วงเวลานี้" });
    else {
      if (
        new Date() >= new Date(rowTimeFirst[0].timeStart) &&
        new Date() <= new Date(rowTimeFirst[0].timeEnd)
      ) {
        await sql.query(commandComplete, [
          rowWaitingLastest[0].pd_code,
          rowWaitingLastest[0].timestamp,
        ]);
      } else {
        const [rowAllTime] = await sql.query(commandSelectAllTime);
        console.log(rowAllTime);
        const indexPartNow = rowAllTime.findIndex((item) => {
          return (
            new Date() >= new Date(item.timeStart) &&
            new Date() <= new Date(item.timeEnd)
          );
        });
        console.log(indexPartNow + " line 61 log");
        if (indexPartNow === -1) {
          console.log("Please update time setup before trigger good");
          await sql.commit();
          reject({ message: "Please update time setup before trigger good" });
        } else {
          console.log(
            rowAllTime[0].timeStart,
            rowAllTime[indexPartNow - 1].timeEnd
          );
          const [workPartAllBefore] = await sql.query(commandSumWorkAllBefore, [
            new Date(rowAllTime[0].timeStart),
            new Date(rowAllTime[indexPartNow - 1].timeEnd),
          ]);
          console.log(workPartAllBefore);
          const [workPlanAllBefore] = await sql.query(
            commandSelectPlanPartAllBefore,
            [
              new Date(rowAllTime[0].timeStart),
              new Date(rowAllTime[indexPartNow - 1].timeEnd),
            ]
          );
          console.log(workPlanAllBefore);
          console.log(
            `${workPartAllBefore[0].SUM} < ${workPlanAllBefore[0].SUM}`
          );
          console.log(workPartAllBefore[0].SUM < workPlanAllBefore[0].SUM);
          if (workPartAllBefore[0].SUM < workPlanAllBefore[0].SUM) {
            console.log("delay");
            await sql.query(commandDelay, [
              rowWaitingLastest[0].pd_code,
              rowWaitingLastest[0].timestamp,
            ]);
          } else {
            console.log("complete");
            await sql.query(commandComplete, [
              rowWaitingLastest[0].pd_code,
              rowWaitingLastest[0].timestamp,
            ]);
          }
          await sql.commit();
          sendMessageWithKey(
            "receive_signal_update_echutter",
            "server_force_to_load_echutter"
          );
          resolve({ message: "success" });
        }
      }
    }
  });
};
exports.onTriggerNonGood = function ({ codeProblem }) {
  return new Promise(async (resolve, reject) => {
    sql = await connectDatabase();
    await sql.beginTransaction();

    commandSelectTimeFirst = `SELECT timeStart,timeEnd FROM setup_production_time LIMIT 1`;
    commandSelectAllTime = `SELECT typeShift,timeStart,timeEnd FROM setup_production_time`;
    commandSelectWaitingLastest = `SELECT pd_code,timestamp FROM e_chutter WHERE status = 'Waiting' LIMIT 1`;
    commandComplete = `UPDATE e_chutter SET status='Complete+Failed' ,date_finish_work=NOW() ,fail_code=${codeProblem} WHERE pd_code = ? AND timestamp = ?`;
    commandDelay = `UPDATE e_chutter SET status='Delay+Failed' ,date_finish_work=NOW(),delay = 1,fail_code=${codeProblem} WHERE pd_code = ? AND timestamp = ?`;
    commandSumWorkAllBefore = `SELECT COUNT(*) AS SUM FROM e_chutter WHERE date_finish_work != '0000-00-00 00:00:00' AND date_finish_work >= ?`;
    commandSelectPlanPartAllBefore = `SELECT SUM(timePlanMin) AS SUM FROM setup_production_time WHERE timeStart >= ? AND timeEnd <= ?`;
    const [rowTimeFirst] = await sql.query(commandSelectTimeFirst);
    const [rowWaitingLastest] = await sql.query(commandSelectWaitingLastest);
    if (rowWaitingLastest.length === 0)
      reject({ message: "ไม่พบข้อมูลในช่วงเวลานี้" });
    else {
      if (
        new Date() >= new Date(rowTimeFirst[0].timeStart) &&
        new Date() <= new Date(rowTimeFirst[0].timeEnd)
      ) {
        await sql.query(commandComplete, [
          rowWaitingLastest[0].pd_code,
          rowWaitingLastest[0].timestamp,
        ]);
      } else {
        const [rowAllTime] = await sql.query(commandSelectAllTime);
        console.log(rowAllTime);
        const indexPartNow = rowAllTime.findIndex((item) => {
          return (
            new Date() >= new Date(item.timeStart) &&
            new Date() <= new Date(item.timeEnd)
          );
        });
        console.log(indexPartNow + " line 61 log");
        if (indexPartNow === -1) {
          reject({ message: "Please update time setup before trigger good" });
        } else {
          const [workPartAllBefore] = await sql.query(commandSumWorkAllBefore, [
            new Date(rowAllTime[0].timeStart),
            new Date(rowAllTime[indexPartNow - 1].timeEnd),
          ]);
          console.log(workPartAllBefore);
          const [workPlanAllBefore] = await sql.query(
            commandSelectPlanPartAllBefore,
            [
              new Date(rowAllTime[0].timeStart),
              new Date(rowAllTime[indexPartNow - 1].timeEnd),
            ]
          );
          console.log(workPlanAllBefore);
          console.log(
            `${workPartAllBefore[0].SUM} < ${workPlanAllBefore[0].SUM}`
          );
          console.log(workPartAllBefore[0].SUM < workPlanAllBefore[0].SUM);
          if (workPartAllBefore[0].SUM < workPlanAllBefore[0].SUM) {
            console.log("delay");
            await sql.query(commandDelay, [
              rowWaitingLastest[0].pd_code,
              rowWaitingLastest[0].timestamp,
            ]);
          } else {
            console.log("complete");
            await sql.query(commandComplete, [
              rowWaitingLastest[0].pd_code,
              rowWaitingLastest[0].timestamp,
            ]);
          }
          await sql.commit();
          sendMessageWithKey(
            "receive_signal_update_echutter",
            "server_force_to_load_echutter"
          );
          resolve({ message: "success" });
        }
      }
    }
  });
};

exports.getEchutterFromDatabase = function () {
  return new Promise(async (resolve) => {
    const sql = await connectDatabase();
    try {
      const [row] = await sql.query(
        "SELECT * FROM workstation1 WHERE datetime"
      );
      resolve({ message: "success", result: row });
    } catch (error) {
      console.log(
        `เกิดข้อผิดพลาดที่ไฟล์ Models/echutter.model.js ที่ฟังก์ชั่น getEchutterFromDatabase log is: ${error}`
      );
    }
  });
};

exports.clearEchutter = function () {
  return new Promise(async (resolve) => {
    const sql = await connectDatabase();
    try {
      await sql.query("TRUNCATE e_chutter");
      sendMessageWithKey(
        "receive_signal_update_echutter",
        "server_force_to_load_echutter"
      );
      resolve({ message: "success" });
    } catch (error) {
      console.log(
        `เกิดข้อผิดพลาดที่ไฟล์ Models/echutter.model.js ที่ฟังก์ชั่น clearEchutter log is: ${error}`
      );
    }
  });
};
