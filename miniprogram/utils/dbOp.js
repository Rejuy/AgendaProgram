const db = wx.cloud.database();
const util_time = require("/time.js");
const util_eventFlush = require("/eventFlush.js");

function dbDelete(condition, index, mainPage){
    var id = mainPage.data.events[condition][index]._id;
    db.collection('Events').doc(id).remove({
        success:function(){
            util_eventFlush.deleteFlush(condition, index, mainPage);
            wx.showModal({
                title: '已删除',
                showCancel:false,
                confirmColor: "#4169E1"
            })   
        },
        fail:function(){
            wx.showModal({
                title: '删除失败',
                content:'请稍后重试，或检查网络连接',
                showCancel:false,
                confirmColor: "#4169E1"
            })
        }
    });
}
module.exports.dbDelete = dbDelete;

function dbFinish(index, mainPage){
    var curTime = util_time.getThisTime();
    var event = mainPage.data.displayEvents[index];
    if(event.mainType == "point"){
        event.condition = 1;
    }
    else if(event.mainType=="period"||(event.mainType=="cycle"&&event.cycleType=="loose")){
        if(event.remainDays >= 1){
            event.remainDays = event.remainDays - 1;
            event.lastClickTime = curTime;
            event.condition = (event.mainType=="period"&&event.remainDays==0)?1:0;
        }
    }
    else{
        event.lastClickTime = curTime;
    }
    if(event.mainType == "cycle"){
        event.finiTasks += 1;
    }
    db.collection('Events').doc(event._id).update({
        data:{
            remainDays: event.remainDays,
            lastClickTime: event.lastClickTime,
            condition: event.condition,
            finiTasks: event.finiTasks
        },
        success:function(){
            //console.log("success");   
            util_eventFlush.finishFlush(event.mainIndex, mainPage, event);
            wx.showModal({
                title: '已完成',
                showCancel:false,
                confirmColor: "#4169E1"
            })           
        },
        fail:function(){
            wx.showModal({
                title: '修改失败',
                content:'请稍后重试，或检查网络连接',
                showCancel:false,
                confirmColor: "#4169E1"
            })
        }
    });
}
module.exports.dbFinish = dbFinish;

function dbGiveup(index, mainPage){
    //console.log(index)
    var event = mainPage.data.displayEvents[index];
    if(event.mainType != "cycle"){
        event.condition = 2;
    }
    else{
        event.condition = (event.allTasks > event.finiTasks)? 2: 1;
    }
    db.collection('Events').doc(event._id).update({
        data:{
            condition:event.condition,
        },
        success:function(){
            util_eventFlush.giveupFlush(event.mainIndex, mainPage, event);
            wx.showModal({
                title: '操作完成',
                showCancel:false,
                confirmColor: "#4169E1"
            }) 
        },
        fail:function(){
            wx.showModal({
                title: '操作失败',
                content:'请稍后重试，或检查网络连接',
                showCancel:false,
                confirmColor: "#4169E1"
            })
        }
    })
}
module.exports.dbGiveup = dbGiveup;

