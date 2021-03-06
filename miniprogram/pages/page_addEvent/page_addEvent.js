const util_date = require("../../utils/date.js");
const util_eventFlush = require("../../utils/eventFlush.js");
const util_time = require("../../utils/time.js");
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
        //console.log(e);
        var legal=true;
        var content="";
        if(this.data.mainType=="point"&&!util_date.judgeTimeLegal(addData)){
            content='您输入的日期或时间不合法，请重新设置';
            legal=false;
        }
        else if(addData.mainType=="cycle"&&addData.cycleType=="tight"&&addData.cycleGap=="week"&&addData.cycleTightDays.length==0){
            content='您每周中选择的日期为零，请重新设置';
            legal=false;
        }
        else if(addData.mainType=="period"&&addData.date<=0){
            content='您选择的天数不合法，请重新设置';
            legal=false;
        }
        if(!legal){
            wx.showModal({
                title: '添加失败',
                content:content,
                showCancel:false,
                confirmColor: "#4169E1"
            })
        }

        else{
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
                addData.remainDays = addData.date;
            }
            //event的新属性：记录上次点击时间
            addData.lastClickTime={
                year:0,month:1,date:1
            }
            addData.lastFlushTime = util_time.getThisTime();
            if(addData.mainType=="cycle"){
                if(addData.cycleType=="loose"){
                    addData.allTasks = addData.cycleGapEach;
                }
                else{
                    if(addData.cycleGap == "day"){
                        addData.allTasks = 1;
                    }
                    else{
                        addData.allTasks = addData.cycleTightDays.length;
                    }
                }
                addData.finiTasks = 0;
            }

            const db = wx.cloud.database();
            db.collection('Events').add({
                data:addData,
                success:function(res){ 
                    addData._id = res._id;
                    let pages = getCurrentPages();    
                    let prevPage = pages[pages.length-2];
                    util_eventFlush.addFlush(addData, prevPage);
                    //console.log("addData = " + addData);
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
        }
        
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
