function getWeight(e, thisDate){
  // console.log("e: "+ e);
  // console.log("thisDate: "+thisDate);
    var today = {};
    var time = new Date();
    today.year = time.getFullYear();
    today.month = time.getMonth()+1;
    today.date = time.getDate();
    var util_date = require("/date.js");
    if(e.mainType == "point"){
      var now = util_date.getDateRange(e.updateTime,today);
      if(now == 0)return 100;
      if(now == 1)return 90;
      if(now <= 3)return 60;
      if(now <= 7)return 40;
      var total = util_date.getDateRange(e.updateTime, e);
      return Math.ceil(now / total);
    }
    else if(e.mainType == "period"){
      return 40;
    }
    else if(e.mainType == "cycle"){
      if(e.cycleType == "tight"){
        if(e.cycleGap == "day")return 100;
        else if(e.cycleGap == "week"){
          // console.log("util:thisDate[3] == " + thisDate[3])
          for(var i = 0; i < e.cycleTightDays.length; i++){
            // console.log("util:")
            if(e.cycleTightDays[i] == thisDate[3]) return 100;
          }
          return 40;
        }
      }
      else if(e.cycleType == "loose"){
        var days = [0,31,28,31,30,31,30,31,31,30,31,30,31];
        if(util_date.ifLeap(thisDate[0])){
          days[2] = 29;
        }
        var remainWork = e.remainDays;
        var remainTime;
        if(e.cycleGapUnit == "week"){
          if(thisDate[3] == 0){remainTime = 0;}
          else{remainTime = 7 - thisDate[3];}
        }
        else{
          remainTime = days[thisDate[1]]-thisDate[2];
        }
        // console.log("util_remainTime: "+remainTime);
        // console.log("util_remainWork: "+remainWork);
        if(remainWork == 0)return 0;
        if(remainTime < remainWork) return 85;
        if(remainTime >= 1.5 * remainWork) return 40;
        return 60;
      }
    }   
}
module.exports.getWeight = getWeight;