function ifLeap(year){
    return ((year%100!=0 && year%4==0)||(year%400==0));
}
module.exports.ifLeap = ifLeap;
function getDateRange(d1,d2){
    if((d1.year>d2.year)||(d1.year==d2.year&&d1.month>d2.month)||(d1.year==d2.year&&d1.month==d2.month&&d1.date>d2.date)){
        return -1;
    }
    if(d1.year == d2.year){
        var days = [0,31,28,31,30,31,30,31,31,30,31,30,31];
        if(ifLeap(d1.year)){
            days[2]=29;
        }
        var ret = 0, i = d1.month, j = d1.date;
        while(i < d2.month){
            ret += days[i];
            i++;
        }
        ret += d2.date - d1.date;
        return ret;
    }
    else{
        var ret = (d2.year-d1.year)*365, begin = d1.year, end = d2.year;
        if((d1.month>2)||(d1.month==2&&d1.date==29)){
            begin++;
            end++;
        }
        for(var i = begin; i < end; i++){
            if(ifLeap(i)){ret++;}
        }
        d1.year = d2.year;
        if((d1.month>d2.month)||(d1.month==d2.month&&d1.date>d2.date)){
            ret -= getDateRange(d2,d1);
        }
        else{
            ret += getDateRange(d1,d2);
        }
        return ret;
    }
}
module.exports.getDateRange = getDateRange;
function judgeTimeLegal(data){
    
    var time=new Date();
    if(data.month>12||data.month<1)
        return false;
    var dateLimit=[0,31,28,31,30,31,30,31,31,30,31,30,31];
    if(ifLeap(data.year))
        dateLimit[2]=29;
    if(data.date>dateLimit[data.month]||data.date<1)
        return false;
    if(data.hour>23||data.hour<0)
        return false;
    if(data.year>time.getFullYear())
        return true;
    if(data.year==time.getFullYear()){
        if(data.month>time.getMonth()+1&&data.month<=12)
            return true;
        if(data.month==time.getMonth()+1){
            if(data.date>time.getDate()&&data.date<=dateLimit[time.getMonth()+1])
                return true;
            if(data.date==time.getDate()){
                if(data.hour>time.getHours()&&data.hour<24)
                    return true;
                if(data.hour==time.getHours()){
                    if(data.minute>time.getMinutes()&&data.minute<60)
                        return true;
                    if(data.minute==time.getMinutes()){
                        if(data.second>time.getSeconds()&&data.second<60)
                            return true;
                    }
                }
            }
        }
    }
    return false;
}
module.exports.judgeTimeLegal = judgeTimeLegal;

function getTimeRange(t1,t2){
    var dayRange=getDateRange(t1,t2);
    
}