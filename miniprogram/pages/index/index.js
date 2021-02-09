//index.js
var app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false
  },

  onLoad: function () {
    console.log('[onLoad]')
  },

  onGetUserInfo: function (e) {
    console.log('[onGetUserInfo]:', e.detail)
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      app.globalData.logged = true
      app.globalData.globalUserInfo = e.detail.userInfo
    }
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.globalOpenId = res.result.openid
        console.log('[onGetOpenid] globalData.curOpenID', app.globalData.globalOpenId)
        wx.switchTab({
          url: '../setRecord/setRecord',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  cancel: function () {
    wx.switchTab({
      url: '../setRecord/setRecord',
    })
  }

})