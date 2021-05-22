const util_event = require("/event.js");
const util_time = require("/time.js");

function addFlush(e, thisDate, mainPage){
    e.weight = util_event.getWeight(e, thisDate);
    const app = getApp();
    var i = 0;
    for(i = 0; i < app.globalData.events[0].length;i++){
        if(app.globalData.events[0][i] <= e.weight) break;
    }
    app.globalData.events[0].splice(i, 0, e);
    mainPage.setData({["events[0]"]:app.globalData.events[0]});
    mainPage.onShow();
}
module.exports.addFlush = addFlush;

function deleteFlush(condition, index, mainPage){
    const app = getApp();
    app.globalData.events[condition].splice(index, 1);
    mainPage.setData({["events["+condition+"]"]:app.globalData.events[condition]});
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
    mainPage.setData({["events["+nowInd+"]"]:app.globalData.events[nowInd]});
    mainPage.onShow();
}
module.exports.updateFlush = updateFlush;

function finishFlush(ind, mainPage){
    const app = getApp();
    var e = app.globalData.events[0][ind];
    e.condition = 1;
    app.globalData.events[1].push(e);
    app.globalData.events[0].splice(ind, 1);
    mainPage.setData({
        ["events[0]"] : app.globalData.events[0],
        ["events[1]"]: app.globalData.events[1]
    });
    mainPage.onShow();
}
module.exports.finishFlush = finishFlush;

function openAppFlush(thisDate, mainPage){
    const app = getApp();
    const db = wx.cloud.database();
    app.globalData.events = [[],[],[]];
    db.collection('Events').where({
        _openid: app.globalData.openId
    }).get({
        success:function(res){
            var preData = res.data;
            var len = preData.length;
            var temp = [];
            for(var i = 0; i < len; i++){
                if(preData[i].condition != 0){
                    app.globalData.events[preData[i].condition].push(preData[i]);
                }
                else if(preData[i].mainType == "point"){
                    if(util_time.timeCmp(preData[i], thisDate) < 0){
                        preData[i].condition = 2;
                        temp.push(preData[i]);
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
                    app.globalData.events[0].push(preData[i]);
                }             
            }
            for(var i = 0; i < app.globalData.events[0].length; i++){
                app.globalData.events[0][i].weight = util_event.getWeight(app.globalData.events[0][i], thisDate);
            }
            for(var i = 0; i < temp.length; i++){
                db.collection('Events').doc(temp[i]._id).set({
                    data:{condition:2}
                });
            }
            function cmp(e1, e2){return e2.weight - e1.weight;}
            app.globalData.events[0].sort(cmp);
            mainPage.setData({events: app.globalData.events});
            for(var i = 0; i < temp.length; i++){
                var ename = (temp[i].abbr == "")? temp[i].type: temp[i].abbr;
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
