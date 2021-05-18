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
