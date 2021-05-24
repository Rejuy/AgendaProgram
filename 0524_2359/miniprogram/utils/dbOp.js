const db = wx.cloud.database();
const util_time = require("/time.js");

function dbFinish(index, mainPage){
    var curMainType=mainPage.data.displayEvents[index].mainType;
    var curCycleType=mainPage.data.displayEvents[index].cycleType;
    //获取当前点击日期
    var curTime = util_time.getThisTime();
    if(curMainType=="point"){
        db.collection('Events').doc(mainPage.data.displayEvents[index]._id).update({
            data:{
                condition:1
            }
        });
    }
    else if(curMainType=="period"||(curMainType=="cycle"&&curCycleType=="loose")){
        var curRemainDays=mainPage.data.displayEvents[index].remainDays;
        if(curRemainDays>1){
            db.collection('Events').doc(mainPage.data.displayEvents[index]._id).update({
                data:{
                    remainDays:curRemainDays-1,   //剩余时间-1
                    lastClickTime:curTime,   //记录上次点击时间
                    condition:(curMainType=="period"&&curRemainDays==1)?1:0
                }
            });
        }
    }
    else{
        db.collection('Events').doc(mainPage.data.displayEvents[index]._id).update({
            data:{
                lastClickTime:curTime   //记录上次点击时间
            }
        });
    }
}
module.exports.dbFinish = dbFinish;