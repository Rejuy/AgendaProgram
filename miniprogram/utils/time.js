function timeCmp(t1, t2){
    if(t1.year && t2.year){
        if(t1.year != t2.year) return t1.year - t2.year;
    }
    if(t1.month && t2.month){
        if(t1.month != t2.month) return t1.month - t2.month;
    }
    if(t1.date && t2.date){
        if(t1.date != t2.date) return t1.date - t2.date;
    }
    if(t1.hour && t2.hour){
        if(t1.hour != t2.hour) return t1.hour - t2.hour;
    }
    if(t1.minute && t2.minute){
        if(t1.minute != t2.minute) return t1.minute - t2.minute;
    }
    if(t1.second && t2.second){
        if(t1.second != t2. second) return t1.second - t2.second;
    }
    return 0;
}
module.exports.timeCmp = timeCmp;

function getThisTime(){
    const time = new Date();
    var ret = {
        year: time.getFullYear(),
        month: time.getMonth()+1,
        date: time.getDate(),
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: time.getSeconds(),
        day: time.getDay()
    };
    return ret;
}
module.exports.getThisTime = getThisTime;

function cmpTime(t1, t2){
    if(t1.year != t2.year) {return t1.year - t2.year;}
    if(t1.month != t2.month) {return t1.month - t2.month;}
    if(t1.date != t2.date) {return t1.date - t2.date;}
    if(t1.hour != t2.hour) {return t1.hour - t2.hour;}
    if(t1.minute != t2.minute) {return t1.minute - t2.minute;}
    if(t1.second != t2.second) {return t1.second - t2.second;}
    return 0;
}
module.exports.cmpTime = cmpTime;