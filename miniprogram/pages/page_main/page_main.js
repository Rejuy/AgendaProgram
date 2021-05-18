// miniprogram/pages/page_main/page_main.js
const util_event=require("../../utils/event.js");
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
        //TO DO
    },
    doFinish:function(e){
        //TO DO
    },
    doDelay:function(condition, index){     //TO DO
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
                    }
                }
            });
        }
    },

})