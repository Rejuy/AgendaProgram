const util_eventFlush = require("../../utils/eventFlush.js");
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
        events:[[],[],[]],
        todayReminds:[],
        todayIfShow:[]
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
    doDetail:function(e){
        
    },
    doFinish:function(e){
        
    },
    doDelay:function(condition, index){
        const thisPage = this;
        const app = getApp();
        const db = wx.cloud.database();
        db.collection('Events').doc(thisPage.events[condition]._id).update({
            success:function(){
                if(thisPage.events[condition].mainType=="period"){

                }
                else{

                }
            },
            fail:function(){
                wx.showModal({
                    title: '操作失败',
                    content:'请稍后重试，或检查网络连接',
                    showCancel:false,
                    confirmColor: "#4169E1"
                })  
            }
        });
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
        var id = e.target.id;
        console.log(id)
        var index = id.substring(6, id.length);
        console.log(index)
        var now = this.data.ifShowDetail[index];
        if(now == true){this.setData({["ifShowDetail["+index+"]"]:false})}
        else{this.setData({["ifShowDetail["+index+"]"]:true})}
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
        //console.log("ccc");
        util_eventFlush.openAppFlush(app.globalData.thisDate, thisPage);
        //console.log("bbb");
        //console.log(thisPage.data.events[0]);
    }

})