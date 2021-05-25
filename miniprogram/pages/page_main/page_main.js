
// miniprogram/pages/page_main/page_main.js
const util_date = require("../../utils/date.js");
const util_eventFlush = require("../../utils/eventFlush.js");
const util_dbOp = require("../../utils/dbOp.js");
const util_event = require("../../utils/event.js");

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
        userStat:{},
        events:[],
        displayEvents:[],
        todayReminds:[],
        todayIfShow:[],
        ifShowRefineDDL:[]
    },

    tapNaviBtn: function(e){
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

    doFinish:function(e){   
        var mainPage = this;
        wx.showModal({
            title:"确认完成任务吗",
            showCancel:true,
            confirmText:"确认",
            confirmColor: "#4169E1",
            cancelText: "取消",
            cancelColor: "#B40014",
            success: function(res){
                if(!res.cancel){
                    var id=e.target.id;
                    var index = Number(id.substring(7,id.length));
                    util_dbOp.dbFinish(index, mainPage);
                }
            }
        });
    },

    doGiveUp:function(e){   
        var mainPage = this;
        var text="";
        var title="";
        var startIndex=0;
        var id=e.target.id;
        if(id[0]=='g'){
            title="放弃今日任务吗？";
            text="放弃任务";
            startIndex=7;
        }
        else{
            title="永久终止该任务吗？";
            text="终止任务";
            startIndex=5;
        }
        wx.showModal({
            title:title,
            showCancel:true,
            confirmText:text,
            confirmColor: "#4169E1",
            cancelText: "取消",
            cancelColor: "#B40014",
            success: function(res){
                if(!res.cancel){
                    var index = Number(id.substring(startIndex,id.length));
                    util_dbOp.dbGiveup(index, mainPage);
                }
            }
        });
    },

    selDelay(e){    //用户选择了delay，那么就在下面弹出“让用户重新输入年月日时分秒”的view
                    //这里也用一个数组来表示，叫做ifShowRefineDDL
        var id = e.target.id;
        //console.log(this.data.ifShowRefineDDL);
        var index=id.charAt(id.length-1);
        this.setData({["ifShowRefineDDL["+index+"]"]:true});
    },

    refineFinish:function(e){    //用户修改完数据，提交或取消
        //console.log(e);
        var id=e.currentTarget.id;
        var index=id.charAt(id.length-1);
        this.setData({["ifShowRefineDDL["+index+"]"]:false});
        this.setData({["todayIfShow["+index+"]"]:false});
    },
    
    refineDDL:function(e){
        var newTime=e.detail.value;
        var id=e.detail.target.id;
        var index=id.charAt(id.length-1);
        //console.log(e);
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
        var index= id.substring(9,10); //abc_10_2
        var ev= id.substring(10,11);
        //console.log("index = "+ index)
        //console.log("ev = " + ev);

        var t=this.data.events[ev][index]._id;
        //console.log(t);
        db.collection('Events').doc(t)
        .remove()
        .then(res=>{
                console.log(res)
        })
    },

    todayShowDetail:function(e){
        var id = e.target.id;
        var index = id.substring(6, id.length);
        var now = this.data.todayIfShow[index];
        if(now == true){
            this.setData({["todayIfShow["+index+"]"]:false});
            this.setData({["ifShowRefineDDL["+index+"]"]:false})
        }
        else{this.setData({["todayIfShow["+index+"]"]:true})}
    },

    openPage_addEvent: function(){
        wx.navigateTo({
            url:"/pages/page_addEvent/page_addEvent"
        });
    },

    onShow:function(){
        //console.log("onShow begin");
        const app = getApp();
        this.setData({events:app.globalData.events});
        //console.log(this.data.events);
        this.setData({displayEvents:util_event.tractDisplayEvents(app.globalData.events)});
        var curIfShow = [];
        for(var i=0;i<this.data.displayEvents.length;i++)
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
        app.globalData.thisDate = {
            year: time.getFullYear(),
            month: time.getMonth()+1,
            date: time.getDate(),
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: time.getSeconds(),
            day: time.getDay()
        }
        util_eventFlush.openAppFlush(thisPage);
    }

})
