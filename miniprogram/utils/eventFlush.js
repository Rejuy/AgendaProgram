const util_event = require("/event.js");
const util_time = require("/time.js");

function addFlush(e, mainPage){
    var thisDate = util_time.getThisTime();
    e.weight = util_event.getWeight(e, thisDate);
    const app = getApp();
    var i = 0;
    for(i = 0; i < app.globalData.events[0].length;i++){
        if(app.globalData.events[0][i] <= e.weight) break;
    }
    app.globalData.events[0].splice(i, 0, e);
    app.globalData.userStat = getUserStat(app.globalData.events);
    mainPage.onShow();
}
module.exports.addFlush = addFlush;

function deleteFlush(condition, index, mainPage){
    const app = getApp();
    app.globalData.events[condition].splice(index, 1);
    app.globalData.userStat = getUserStat(app.globalData.events);
    mainPage.onShow();
}
module.exports.deleteFlush = deleteFlush;

function updateFlush(preCondi, preInd, nowEvent, mainPage){
    const app = getApp();
    app.globalData.events[preCondi].splice(preInd, 1);
    mainPage.setData({["events["+preCondi+"]"]:app.globalData.events[preCondi]});
    e.weight = util_event.getWeight(e, thisDate);

    var i = 0; var nowInd = nowEvent.condition;
    for(i = 0; i < app.globalData.events[nowInd].length;i++){
        if(app.globalData.events[nowInd][i] <= nowEvent.weight) break;
    }
    app.globalData.events[nowInd].splice(i, 0, nowEvent);
    app.globalData.userStat = getUserStat(app.globalData.events);
    mainPage.onShow();
}
module.exports.updateFlush = updateFlush;

function finishFlush(ind, mainPage){
    const app = getApp();
    var e = app.globalData.events[0][ind];
    e.condition = 1;
    app.globalData.events[1].push(e);
    app.globalData.events[0].splice(ind, 1);
    app.globalData.userStat = getUserStat(app.globalData.events);
    mainPage.onShow();
}
module.exports.finishFlush = finishFlush;

function giveupFlush(ind, mainPage){
    const app = getApp();
    var e = app.globalData.events[0][ind];
    e.condition = 2;
    app.globalData.events[2].push(e);
    app.globalData.events[0].splice(ind, 1);
    app.globalData.userStat = getUserStat(app.globalData.events);
    mainPage.onShow();
}
module.exports.giveupFlush = giveupFlush;

function openAppFlush(mainPage){
    var thisDate = util_time.getThisTime();
    const app = getApp();
    const db = wx.cloud.database();
    app.globalData.events = [[],[],[]];
    db.collection('Events').where({
        _openid: app.globalData.openId
    }).get({
        success:function(res){
            var preData = res.data;
            var len = preData.length;
            var pastDue = [];
            //var temp = [];
            var reset = [];
            for(var i = 0; i < len; i++){
                if(preData[i].condition != 0){
                    app.globalData.events[preData[i].condition].push(preData[i]);
                }
                else if(preData[i].mainType == "point"){
                    if(util_time.timeCmp(preData[i], thisDate) < 0){
                        preData[i].condition = 2;
                        pastDue.push(preData[i]);
                        app.globalData.events[2].push(preData[i]);
                    }
                    else{
                        app.globalData.events[0].push(preData[i]);
                    }
                }
                else if(preData[i].mainType == "period"){
                    app.globalData.events[0].push(preData[i]);
                }   
                else{
                    if(preData[i].cycleType == "loose"){
                        if((preData[i].cycleGapUnit == "month" && thisDate.date == 1) || (preData[i].cycleGapUnit == "week" && thisDate.day == 1)){
                            preData[i].remainDays = preData[i].cycleGapEach;
                            reset.push(preData[i]);
                        }
                    }
                    app.globalData.events[0].push(preData[i]);
                }             
            }
            for(var i = 0; i < app.globalData.events[0].length; i++){
                app.globalData.events[0][i].weight = util_event.getWeight(app.globalData.events[0][i], thisDate);
            }
            for(var i = 0; i < pastDue.length; i++){
                db.collection('Events').doc(pastDue[i]._id).set({
                    data:{condition:2}
                });
            }
            for(var i = 0; i < reset.length; i++){
                db.collection('Events').doc(reset[i]._id).set({
                    data:{remainDays:reset[i].remainDays}
                });
            }
            function cmp(e1, e2){return e2.weight - e1.weight;}
            app.globalData.events[0].sort(cmp);
            app.globalData.userStat = getUserStat(app.globalData.events);
            mainPage.setData({
                events: app.globalData.events,
                userStat:app.globalData.userStat
            });
            mainPage.onShow();
            for(var i = 0; i < pastDue.length; i++){
                var ename = (pastDue[i].abbr == "")? pastDue[i].type: pastDue[i].abbr;
                wx.showModal({
                    title: '事件过期',
                    content: ename,
                    showCancel:false,
                    confirmColor: "#4169E1"
                });
            }
        },
        fail:function(){
            wx.showModal({
                title: '获取数据失败',
                content:'请稍后重试，或检查网络连接',
                showCancel:false,
                confirmColor: "#4169E1"
            })   
        }
    });
}
module.exports.openAppFlush = openAppFlush;


function getUserStat(events){
    var procCnt = events[0].length;
    var finiCnt = events[1].length;
    var unfiCnt = events[2].length;
    var total = procCnt + finiCnt + unfiCnt;
    var life = 0, study = 0, work = 0;
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < events[i].length; j++){
            if(events[i][j].type == "生活"){life++;}
            else if(events[i][j].type == "学习"){study++;}
            else{work++;}
        }
    }
    var stat = {
        procNum:procCnt,
        finiNum:finiCnt,
        unfiNum:unfiCnt,
        totalNum:total,
        lifePercent:(life/total*100).toFixed(0),
        studyPercent:(study/total*100).toFixed(0),
        workPercent:(work/total*100).toFixed(0)
    }
    return stat;
}