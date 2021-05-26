const util_event = require("/event.js");
const util_time = require("/time.js");
const util_date = require("/date.js");

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

function updateFlush(e, mainPage){
    const app = getApp();
    app.globalData.events[0].splice(e.mainIndex, 1);
    var thisDate = util_time.getThisTime();
    e.weight = util_event.getWeight(e, thisDate);
    var i = 0;
    for(i = 0; i < app.globalData.events[0].length; i++){
        if(app.globalData.events[0][i].weight <= i){break;}
    }
    app.globalData.events[0].splice(i, 0, e);
    app.globalData.userStat = getUserStat(app.globalData.events);
    mainPage.onShow();
}
module.exports.updateFlush = updateFlush;

function finishFlush(ind, mainPage, e){
    const app = getApp();
    if(e.condition == 1){
        app.globalData.events[0].splice(ind, 1);
        app.globalData.events[1].push(e);
    }
    else if(e.condition == 0){
        app.globalData.events[0][ind] = e;
    }
    app.globalData.userStat = getUserStat(app.globalData.events);
    mainPage.onShow();
}
module.exports.finishFlush = finishFlush;

function giveupFlush(ind, mainPage, e){
    const app = getApp();
    app.globalData.events[0].splice(ind, 1);
    app.globalData.events[e.condition].push(e);
    app.globalData.userStat = getUserStat(app.globalData.events);
    mainPage.onShow();
}
module.exports.giveupFlush = giveupFlush;

function openAppFlush(mainPage){
    //console.log("x1")
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
            var cyclePastDue = [];
            var cyclePastDueRemain = [];
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
                    var dateRange = util_date.getDateRange(preData[i].lastFlushTime, thisDate);
                    if(preData[i].cycleType == "loose"){
                        if(preData[i].cycleGapUnit == "month"){
                            if(preData[i].lastFlushTime.month != thisDate.month){
                                if(preData[i].allTasks > preData[i].finiTasks){
                                    cyclePastDue.push(preData[i]);
                                    cyclePastDueRemain.push(preData[i].allTasks-preData[i].finiTasks);
                                }
                                preData[i].allTasks += preData[i].cycleGapEach;
                                preData[i].remainDays = preData[i].cycleGapEach;
                                preData[i].lastFlushTime = thisDate;
                                reset.push(preData[i]);
                            }
                        }
                        else{
                            if(dateRange >= 7){
                                if(preData[i].allTasks > preData[i].finiTasks){
                                    cyclePastDue.push(preData[i]);
                                    cyclePastDueRemain.push(preData[i].allTasks-preData[i].finiTasks);
                                }
                                preData[i].allTasks += preData[i].cycleGapEach;
                                preData[i].remainDays = preData[i].cycleGapEach;
                                preData[i].lastFlushTime = thisDate;
                                reset.push(preData[i]);
                            }
                        }
                    }
                    else{
                        if(preData[i].cycleGap == "day"){
                            if(dateRange >= 1){
                                if(preData[i].allTasks > preData[i].finiTasks){
                                    cyclePastDue.push(preData[i]);
                                    cyclePastDueRemain.push(preData[i].allTasks-preData[i].finiTasks);
                                }
                                preData[i].allTasks += dateRange;
                                preData[i].lastFlushTime = thisDate;
                                reset.push(preData[i]);
                            }
                        }
                        else{
                            if(dateRange >= 7){
                                if(preData[i].allTasks > preData[i].finiTasks){
                                    cyclePastDue.push(preData[i]);
                                    cyclePastDueRemain.push(preData[i].allTasks-preData[i].finiTasks);
                                }
                                var add = Math.ceil(dateRange / 7)*preData[i].cycleTightDays.length;
                                preData[i].allTasks += add;
                                preData[i].lastFlushTime = thisDate;
                                reset.push(preData[i]);
                            }
                        }
                    }
                    app.globalData.events[0].push(preData[i]);
                }                       
            }
            for(var i = 0; i < pastDue.length; i++){
                db.collection('Events').doc(pastDue[i]._id).update({
                    data:{condition:2}
                });
            }
            for(var i = 0; i < reset.length; i++){
                if(reset[i].cycleType == "loose"){
                    db.collection('Events').doc(reset[i]._id).update({
                        data:{
                            remainDays:reset[i].remainDays,
                            allTasks:reset[i].allTasks,
                            lastFlushTime:reset[i].lastFlushTime
                        }
                    });
                }
                else{
                    db.collection('Events').doc(reset[i]._id).update({
                        data:{
                            allTasks:reset[i].allTasks,
                            lastFlushTime:reset[i].lastFlushTime
                        }
                    });
                }
            }
            //var thisDate = util_time.getThisTime()
            //console.log("x1")
            for(var i = 0; i < app.globalData.events[0].length;i++){
                app.globalData.events[0][i].weight = util_event.getWeight(app.globalData.events[0][i], thisDate);
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
            for(var i = 0; i < cyclePastDue.length; i++){
                var ename = (pastDue[i].abbr == "")? pastDue[i].type: pastDue[i].abbr;
                wx.showModal({
                    title: '事件过期',
                    content: ename+" 剩余 " + (cyclePastDueRemain[i]) + " 次未完成",
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
    
    var len0 = events[0].length, len1 = events[1].length, len2 = events[2].length;
    //console.log(len0)
    var notCycleNum = 0;
    var tLife = 0, tStudy = 0, tWork = 0;
    var cycles = [], cycleEachPct = [];
    var notCycleCnt = [0,0,0];
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < events[i].length; j++){
            var e = events[i][j];
            if(e.mainType == "cycle"){cycles.push(e);}
            else{notCycleCnt[i]++; notCycleNum++;}
            if(events[i][j].type == "生活"){tLife++;}
            else if(events[i][j].type == "学习"){tStudy++;}
            else{tWork++;}
        }
    }
    var totalTasks = 0, totalFiniTasks = 0;
    //console.log(cycles)
    for(var i = 0; i < cycles.length; i++){
        cycleEachPct.push(Math.round(cycles[i].finiTasks / cycles[i].allTasks * 100));
        totalTasks += cycles[i].allTasks;
        totalFiniTasks += cycles[i].finiTasks;
    }
    var ret = {
        cycle:{
            nums: cycles.length,
            arr: cycles,
            eachPct: cycleEachPct,
            totalPct: (cycles.length==0)? "-": Math.round(totalFiniTasks/totalTasks*100)
        },
        notCycle:{
            nums: notCycleNum,
            cnt: notCycleCnt,
            pct: (notCycleNum == 0)? ["-", "-", "-"]: [
                Math.round(notCycleCnt[0] / notCycleNum * 100),
                Math.round(notCycleCnt[1] / notCycleNum * 100),
                Math.round(notCycleCnt[2] / notCycleNum * 100)
            ] 
        },
        total:{
            nums: len0 + len1 + len2,
            pct: (len0+len1+len2 == 0)? {life:"-",study:"-",work:"-"}: {
                    life: Math.round(tLife / (len0+len1+len2) * 100),
                    study: Math.round(tStudy / (len0+len1+len2) * 100),
                    work: Math.round(tWork / (len0+len1+len2) * 100)
                }                
        }
    };
    //console.log("stat end")
    return ret;
}