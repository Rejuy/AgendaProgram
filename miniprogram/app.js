//app.js

App({

  globalData:{
    openId:"",
    ifLogin:false,
    events:[[],[],[]],
    thisDate:[],
  },

  


  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'cloud1-7g5ex32sec733074'
      });
      
    }
  }
})
