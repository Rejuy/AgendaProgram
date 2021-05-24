// miniprogram/pages/page_main/page_main.js
const util_event=require("../../utils/event.js");
const util_date = require("../../utils/date.js");
Page({

    data: {
        viewNo:0,
        subViewNo:0,
        naviMain:{
            "icon":["today","list", "user"],
            "text":["今日","列表","我的"],
            "state":["on","off","off"]
        },
        views:[{
            "viewName":"today"
        },{
            "viewName":"list",
            "text":["进行中","已完成","未完成"],
            "state":["on","off","off"]
        },{
            "viewName":"user"}
        ],
        events:[],
        displayEvents:[],
        todayReminds:[],
        todayIfShow:[],
        ifShowRefineDDL:[]
    },
    tapNaviBtn: function(e){
        var app = getApp();
        console.log(app.globalData);
        var id = e.currentTarget.id;
        var to = id.charAt(id.length-1);
        var from = this.data.viewNo;
        if(from != to){
            this.setData({
                ["naviMain.state["+to+"]"]:"on",
                ["naviMain.state["+from+"]"]:"off",
                viewNo:to
            })
        }
    },
    tapSubNaviBtn: function(e){
        var view = this.data.viewNo
        var id = e.currentTarget.id;
        var to = id.charAt(id.length-1);
        var from = this.data.subViewNo;
        if(from != to){
            this.setData({
                ["views["+view+"].state["+from+"]"]:"off",
                ["views["+view+"].state["+to+"]"]:"on",
                subViewNo:to
            })
        }
    },

    doFinish:function(e){   //完成
        var id=e.target.id;
        var index=id.charAt(id.length-1);
        const db = wx.cloud.database();
        var curMainType=this.data.displayEvents[index].mainType;
        var curCycleType=this.data.displayEvents[index].curCycleType;
        //获取当前点击日期
        var time = new Date();
        var curTime={year:time.getFullYear(),month:time.getMonth()+1,date:time.getDate()};
        if(curMainType=="point"){
            db.collection('Events').doc(this.data.displayEvents[index]._id).update({
                data:{
                    condition:1
                }
            });
        }
        else if(curMainType=="period"||(curMainType=="cycle"&&curCycleType=="loose")){
            var curRemainDays=this.data.displayEvents[index].remainDays;
            if(curRemainDays>1){
                db.collection('Events').doc(this.data.displayEvents[index]._id).update({
                    data:{
                        remainDays:curRemainDays-1,   //剩余时间-1
                        lastClickTime:curTime,   //记录上次点击时间
                        condition:(curMainType=="period"&&curRemainDays==1)?1:0
                    }
                });
            }
        }
        else{
            db.collection('Events').doc(this.data.displayEvents[index]._id).update({
                data:{
                    lastClickTime:curTime   //记录上次点击时间
                }
            });
        }


        //调用更新page数据的函数
    },

    doGiveUp:function(e){   //完成
        var id=e.target.id;
        var index=id.charAt(id.length-1);
        const db = wx.cloud.database();
        var curMainType=this.data.displayEvents[index].mainType;
        //获取当前点击日期
        var time = new Date();
        var curTime={year:time.getFullYear(),month:time.getMonth()+1,date:time.getDate()};
        if(curMainType=="point"){
            db.collection('Events').doc(this.data.displayEvents[index]._id).update({
                data:{
                    condition:2
                }
            });
        }
        else{
            db.collection('Events').doc(this.data.displayEvents[index]._id).update({
                data:{
                    lastClickTime:curTime   //记录上次点击时间
                }
            });
        }


        //调用更新page数据的函数
    },

    selDelay(e){    //用户选择了delay，那么就在下面弹出“让用户重新输入年月日时分秒”的view
                    //这里也用一个数组来表示，叫做ifShowRefineDDL
        var id = e.target.id;
        console.log(this.data.ifShowRefineDDL);
        var index=id.charAt(id.length-1);
        this.setData({["ifShowRefineDDL["+index+"]"]:true});
    },

    refineFinish(e){    //用户修改完数据，提交或取消
        console.log(e);
        var id=e.currentTarget.id;
        var index=id.charAt(id.length-1);
        this.setData({["ifShowRefineDDL["+index+"]"]:false});
        this.setData({["todayIfShow["+index+"]"]:false});
    },
    
    refineDDL:function(e){
        var newTime=e.detail.value;
        var id=e.detail.target.id;
        var index=id.charAt(id.length-1);
        console.log(e);
        const db=wx.cloud.database();
        if(!util_date.judgeTimeLegal(newTime)){
            wx.showModal({
                title: '添加失败',
                content:'您输入的日期或时间不合法，请重新设置',
                showCancel:false,
                confirmColor: "#4169E1"
            })
        }
        else{
            db.collection('Events').doc(this.data.displayEvents[index]._id).update({
                data:{
                    year:newTime.year,
                    month:newTime.month,
                    date:newTime.date,
                    hour:newTime.hour,
                    minute:newTime.minute,
                    second:newTime.second,
                    condition:0
                }
            });
        }
        //调用更新page数据的函数
    },

    dele(e){
        const db = wx.cloud.database();
        var id=e.target.id;
        var index= id.substring(9,10);
        var ev= id.substring(10,11);
        var t=this.data.events[ev][index]._id;
        db.collection('Events').doc(t)
        .remove()
        .then(res=>{
                console.log(res)
        })
    },
    doDelete:function(condition, index){
        const thisPage = this;
        const app = getApp();
        const db = wx.cloud.database();
        db.collection('Events').doc(thisPage.events[condition]._id).remove({
            success:function(){
                app.globalData.events[condition].splice(index,1);
                thisPage.setData({["events["+condition+"]"]:app.globalData.events[condition]});
                wx.showModal({
                    title: '已删除',
                    showCancel:false,
                    confirmColor: "#4169E1",
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
        })
    },

    todayShowDetail:function(e){
        console.log(e);
        var id = e.target.id;
        console.log(id);
        var index = id.substring(6, id.length);
        console.log(index);
        console.log(this.data.ifShowRefineDDL);
        var now = this.data.todayIfShow[index];
        if(now == true){
            this.setData({["todayIfShow["+index+"]"]:false});
            this.setData({["ifShowRefineDDL["+index+"]"]:false})
        }
        else{this.setData({["todayIfShow["+index+"]"]:true})}
    },
    openPage_addEvent: function(){
        // console.log(this.data.events[0])
        wx.navigateTo({
            url:"/pages/page_addEvent/page_addEvent"
        });
    },

    onShow:function(){
        const app = getApp();
        
        this.setData({events:app.globalData.events});
        this.setData({["displayEvents"]:app.globalData.events[0]});
        //console.log(events[0]);
        //console.log(displayEvents);
        var curIfShow=[];
        for(var i=0;i<displayEvents.length;i++)
            curIfShow.push(false);
        this.setData({todayIfShow:curIfShow});
        this.setData({ifShowRefineDDL:curIfShow});
    },

    onLoad: function (options) {
        const app = getApp();
        const thisPage = this;
        wx.cloud.callFunction({
            name:'getUserInfo',
            complete: res=>{
                app.globalData.ifLogin = true;
                app.globalData.openId = res.result.openId;
            }
        })
        const time = new Date();
        app.globalData.thisDate = [time.getFullYear(),time.getMonth()+1,time.getDate(),time.getDay()];

        const db = wx.cloud.database();
        for(var i = 0; i < 3; i++){
            db.collection('Events').where({
                _openid: app.globalData.openId,
                condition: i
            }).get({
                success:function(res){
                    var temp = res.data;
                    var len = temp.length;
                    if(len != 0){
                        var index = temp[0].condition;
                        if(index == 0){
                            var tShow = [];
                            for(var j = 0; j < len; j++){tShow.push(false);}
                            thisPage.setData({todayIfShow:tShow});
                            thisPage.setData({ifShowRefineDDL:tShow});
                        }
                        // console.log(index + " : "+ temp);
                        const thisDate = app.globalData.thisDate;
                        for(var j = 0; j < len; j++){
                            temp[j].weight = util_event.getWeight(temp[j],thisDate);
                        }
                        function cmp(e1, e2){
                            return e2.weight - e1.weight;
                        }
                        temp.sort(cmp);
                        // for(var j = 0; j < len; j++){
                        //     console.log(temp[j].weight);
                        // }
                        app.globalData.events[index] = temp;
                        // console.log("AAA");
                        thisPage.setData({["events["+index+"]"]:temp});
                        // console.log("mainPage:"+thisPage.data.events[index]);
                        thisPage.setData({["displayEvents"]:temp});
                    }
                }
            });
        }
        
    },

})