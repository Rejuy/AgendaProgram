Page({


    data: {

    },

    doLogin:function(){
        const app = getApp();
        wx.cloud.callFunction({
            name:'getUserInfo',
            complete: res=>{
                // console.log(res)
                app.globalData.ifLogin = true;
                app.globalData.openId = res.result.openId;
                wx.redirectTo({
                  url: '/pages/page_main/page_main'
                })
            }
        })
    }

})