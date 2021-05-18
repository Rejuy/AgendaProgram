const util_event = require("../../utils/event.js");
const util_date = require("../../utils/date.js");
Page({

    data: {
        mainType:"point",
        cycleType:"tight",
        cycleGap:"day",
        cycleGapUnit:"week",
        cycleGapEach:1,
        
        daysInMonth:[],
        daysInWeek:[1,2,3,4,5,6],
        nowTime:[],
    },
    
    selMainType:function(e){
        this.setData({mainType:e.detail.value,cycleType:"tight",cycleGap:"day",cycleGapEach:1});
    },

    selCycleType:function(e){
        this.setData({cycleType:e.detail.value,cycleGap:"day",cycleGapUnit:"week",cycleGapEach:1});
    },

    selCycleGap:function(e){
        this.setData({cycleGap:e.detail.value});
    },

    selCycleGapUnit:function(e){
        this.setData({cycleGapUnit:e.detail.value,cycleGapEach:1});
    },

    selCycleGapEach:function(e){
        this.setData({cycleGapEach:e.detail.value[0]+1});
    },

    submitForm:function(e){
        var addData = e.detail.value;
        const app = getApp();
        var time = new Date();
        addData.condition = 0;
        addData.updateTime = {year:time.getFullYear(),month:time.getMonth()+1,date:time.getDate(),day:time.getDay()};
        if(addData.mainType=="cycle"&&addData.cycleType=="loose"){
            addData.cycleGapEach = this.data.cycleGapEach;
            addData.remainDays = addData.cycleGapEach;
        }
        else if(addData.mainType=="point"){
            addData.remainDays = util_date.getDateRange(addData.updateTime, addData);
        }
        else if(addData.mainType=="period"){
            addData.remainDays = addData.month * 30 + addData.date;
        }

        const db = wx.cloud.database();
        db.collection('Events').add({
            data:addData,
            success:function(res){   
                var temp = app.globalData.events[0];
                // console.log("temp: "+temp);
                var len = temp.length;
                // console.log("addData: "+addData);
                addData.weight = util_event.getWeight(addData, app.globalData.thisDate);
                // console.log("aa")
                var i = 0;
                while(i < len && addData.weight < temp[i].weight){i++;}
                temp.splice(i, 0, addData);
                app.globalData.allEvents = temp;
                wx.showModal({
                    title: '添加成功',
                    showCancel:false,
                    confirmColor: "#4169E1",
                    success:function(){
                        wx.navigateBack();
                    }
                })           
            },
            fail:function(){
                wx.showModal({
                    title: '添加失败',
                    content:'请稍后重试，或检查网络连接',
                    showCancel:false,
                    confirmColor: "#4169E1"
                })   
            }
        })
    },

    toMainPage:function(){
        wx.showModal({
            content:"取消添加并返回上一页",
            showCancel:true,
            confirmText:"确认",
            confirmColor: "#000000",
            cancelText: "再看看",
            cancelColor: "#000000",
            success: function(res){
                if(res.confirm){
                    wx.navigateBack()
                }
            }
        })
    },

    onLoad: function (options) {
        var time = new Date();
        var arr=[time.getFullYear(),time.getMonth()+1,time.getDate(),time.getDay()];     
        var days=[];
        for(var i = 1; i <= 27; i++){days.push(i);}
        this.setData({nowTime:arr,daysInMonth:days});
    },

    onUnload: function () {
        
    },
 
})