const util_time = require("/time.js");
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
      var time={year:e.year,month:e.month,date:e.date};
      var now = util_date.getDateRange(time,today);
      var timeInDay=0;
      timeInDay=Number(e.hour)+Number(e.minute/60)+Number(e.second/(60*60));
      if(now == 0){
        return 100-timeInDay;
      }
      now+=timeInDay/24;
      console.log(now);
      console.log((500-now) / 30);
      return Math.ceil((500-now) / 30);
    }
    else if(e.mainType == "period"){
      return 40;
    }
    else if(e.mainType == "cycle"){
      if(e.cycleType == "tight"){
        if(e.cycleGap == "day")return 70;
        else if(e.cycleGap == "week"){
          // console.log("util:thisDate[3] == " + thisDate[3])
          for(var i = 0; i < e.cycleTightDays.length; i++){
            // console.log("util:")
            if(e.cycleTightDays[i] == thisDate[3]) return 70;
          }
          return 0;
        }
      }
      else if(e.cycleType == "loose"){
        return 60;
        /*var days = [0,31,28,31,30,31,30,31,31,30,31,30,31];
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
        return 60;*/
      }
    }   
}
module.exports.getWeight = getWeight;

function tractDisplayEvents(events){
  var curTime = util_time.getThisTime();
  var ret = [];
  for(var i=0;i<events[0].length;i++){
    var e = events[0][i];
    var todayClicked = (e.lastClickTime.year==curTime.year&&e.lastClickTime.month==curTime.month&&e.lastClickTime.date==curTime.date);
    if(e.mainType == "point"){
      ret.push(e);
      ret[ret.length-1].mainIndex = i;
    }
    else if(e.mainType == "period"){
      if(!todayClicked){
        ret.push(e);
        ret[ret.length-1].mainIndex = i;
      }
    }
    else{
      if(e.cycleType == "tight"){
        if(e.cycleGap == "day"){
          if(!todayClicked){
            ret.push(e);
            ret[ret.length-1].mainIndex = i;
          }
        }
        else{
          var isToday = false;
          for(var j = 0; j < e.cycleTightDays.length; j++){

            if(curTime.day.toString() == e.cycleTightDays[j]){
              isToday = true; break;
            }
          }
          if(!todayClicked && isToday){
            ret.push(e);
            ret[ret.length-1].mainIndex = i;
          }
        }
      }
      else{
        if(!todayClicked){
          ret.push(e);
          ret[ret.length-1].mainIndex = i;
        }
      }
    }
  }
  return ret;
}
module.exports.tractDisplayEvents=tractDisplayEvents;
