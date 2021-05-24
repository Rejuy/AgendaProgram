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

function cmpTime(t1,t2,cmpDay){  
  //cmpDay==true则比较日期，否则比较到分和秒
  //t1>t2返回1,t1==t2返回0,t1<t2返回-1
  if(cmpDay==false){
    if(t1.year>t2.year)
      return 1;
    else if(t1.year==t2){
      if(t1.month>t2.month)
        return 1;
      else if(t1.month==t2.month){
        if(t1.date>t2.date)
          return 1;
        else if(t1.date==t2.date){
          if(t1.hour>t2.hour)
            return 1;
          else if(t1.hour==t2.hour){
            if(t1.minute>t2.minute)
              return 1;
            else if(t1.minute==t2.minute){
              if(t1.second>t2.second)
                return 1;
              else if(t1.second==t2.second){
                return 0;
              }
            } 
          }
        }
      }
    }
    return -1;
  }
  else{
    if(t1.year>t2.year)
      return 1;
    else if(t1.year==t2){
      if(t1.month>t2.month)
        return 1;
      else if(t1.month==t2.month){
        if(t1.date>t2.date)
          return 1;
        else if(t1.date==t2.date){
          return 0;
        }
      }
    }
    return -1;
  }
}
module.exports.cmpTime = cmpTime;

function tractDisplayEvents(events){
  var time=new Date();
  var curYear=time.getFullYear();
  var curMonth=time.getMonth()+1;
  var curDate=time.getDate();
  var curHour=time.getHours();
  var curMinute=time.getMinutes();
  var curSecond=time.getSeconds();
  var curTime={
    year:curYear,
    month:curMonth,
    date:curDate,
    hour:curHour,
    minute:curMinute,
    second:curSecond
  };
  displayEvents=[];
  for(var i=0;i<events[0].length;i++){
    if(events[0][i].mainType=="point"){
      if(cmpTime(events[0][i],curTime,false)==1)
        displayEvents.push(events[0][i]);
    }
    else if(events[0][i].mainType=="cycle"&&events[0][i].cycleGap=="week"){
      if(cmpTime(events[0][i].lastClickTime,curTime,true)==-1&&events[0][i].cycleTightDays.indexOf(time.getDay())>=0)
        displayEvents.push(events[0][i]);
    }
    else{
      if(cmpTime(events[0][i].lastClickTime,curTime,true)==-1)
        displayEvents.push(events[0][i]);
    }
  }
  return displayEvents;
}
module.exports.tractDisplayEvents=tractDisplayEvents;