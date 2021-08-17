class Time {
  constructor(time, overflow) {
    if (time === undefined) {
      this.dateNow = new Date();
      this.hours = this.dateNow.getHours();
      this.minute = this.dateNow.getMinutes();
      this.second = this.dateNow.getSeconds();
      this.timeString = `${this.hours.toString().padStart(2, "0")}:${this.minute
        .toString()
        .padStart(2, "0")}:${this.second.toString().padStart(2, "0")}`;
      if (overflow === undefined) {
        this.overflow = false;
      } else {
        this.overflow = overflow;
      }
    } else {
      this.checkErrorPattern(time);
      this.splitTime = time.split(":");
      this.hours = parseInt(this.splitTime[0]);
      this.minute = parseInt(this.splitTime[1]);
      this.second = parseInt(this.splitTime[2]);
      this.timeString = `${this.splitTime[0]}:${this.splitTime[1]}:${this.splitTime[2]}`;
      if (overflow === undefined) {
        this.overflow = false;
      } else {
        this.overflow = overflow;
      }
    }
  }
  setOverflow(bool = false) {
    return new Time(this.timeString, bool);
  }
  isOverflow() {
    return this.overflow;
  }
  checkErrorPattern(time) {
    this.regExp = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$");
    if (this.regExp.test(time) !== true) {
      throw TypeError("Error time not valid with 00:00:00");
    }
  }
  isLessThan(time2) {
    //console.log(`${this.timeString} < ${time2.timeString}`);
    this.checkErrorPattern(time2.timeString);
    if (
      (this.overflow === true && time2.overflow === true) ||
      (this.overflow === false && time2.overflow === false)
    ) {
      if (this.hours < time2.hours) return true;
      else if (this.minute < time2.minute) return true;
      else if (this.second < time2.second) return true;
      else return false;
    } else if (this.overflow === true && time2.overflow === false) {
      return false;
    } else if (this.overflow === false && time2.overflow === true) {
      return true;
    }
  }
  isGreaterThan(time2) {
    //console.log(`${this.timeString} < ${time2.timeString}`);
    this.checkErrorPattern(time2.timeString);
    if (
      (this.overflow === true && time2.overflow === true) ||
      (this.overflow === false && time2.overflow === false)
    ) {
      if (this.hours > time2.hours) return true;
      else if (this.minute > time2.minute) return true;
      else if (this.second > time2.second) return true;
      else return false;
    } else if (this.overflow === true && time2.overflow === false) {
      return true;
    } else if (this.overflow === false && time2.overflow === true) {
      return false;
    }
  }
  isEqual(time2) {
    if (
      (this.overflow === true && time2.overflow === true) ||
      (this.overflow === false && time2.overflow === false)
    ) {
      this.checkErrorPattern(time2.timeString);
      if (
        this.hours === time2.hours &&
        this.minute === time2.minute &&
        this.second === time2.second
      )
        return true;
      else return false;
    } else if (this.overflow === true && time2.overflow === false) {
      return false;
    } else if (this.overflow === false && time2.overflow === true) {
      return false;
    }
  }
  isNotEqual(time2) {
    return !this.isEqual(time2);
  }
  isBetween(time2, time3) {
    if (this.isGreaterThan(time2) && this.isLessThan(time3)) return true;
    else return false;

    //console.log(`${time2.timeString} < ${this.timeString} < ${time3.timeString}`);
  }
  isNotBetween(time2, time3) {
    return !this.isBetween(time2, time3);
  }

  isLessThanHours(time2) {
    //console.log(`${this.timeString} < ${time2.timeString}`);
    this.checkErrorPattern(time2.timeString);
    if (this.hours < time2.hours) return true;
    else return false;
  }
  isLessThanHoursOverflow(time2) {
    //console.log(`${this.timeString} < ${time2.timeString}`);
    this.checkErrorPattern(time2.timeString);
    if (this.hours < time2.hours + 24) return true;
    else return false;
  }
  isGreaterThanHours(time2) {
    //console.log(`${this.timeString} < ${time2.timeString}`);
    this.checkErrorPattern(time2.timeString);
    if (this.hours > time2.hours) return true;
    else return false;
  }
  isGreaterThanHoursOverflow(time2) {
    //console.log(`${this.timeString} < ${time2.timeString}`);
    this.checkErrorPattern(time2.timeString);
    if (this.hours > time2.hours + 24) return true;
    else return false;
  }
  isEqualHours(time2) {
    //console.log(`${this.timeString} === ${time2.timeString}`);
    this.checkErrorPattern(time2.timeString);
    if (this.hours === time2.hours) return true;
    else return false;
  }
  isNotEqualHours(time2) {
    //console.log(`${this.timeString} !== ${time2.timeString}`);
    return !this.isEqualHours(time2);
  }
  isBetweenHours(time2, time3) {
    // console.log(`${time2.timeString} < ${this.timeString} < ${time3.timeString}`);
    if (this.isGreaterThanHours(time2) && this.isLessThanHours(time3))
      return true;
    else return false;
  }
  isBetweenHoursOverflow(time2, time3) {
    // console.log(`${time2.timeString} < ${this.timeString} < ${time3.timeString}`);
    if (this.isGreaterThanHours(time2) && this.isLessThanHours(time3))
      return false;
    else return true;
  }
  isNotBetweenHours(time2, time3) {
    return !this.isBetweenHours(time2, time3);
  }
}

module.exports = Time;
