//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false
  },

  onLoad: function () {

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log('[getUserInfo]:',res)
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                logged: true
              })
              app.globalData.logged = true
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      app.globalData.logged = true
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
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
    // 查询当前用户在数据库中的数据条目数
		const db = wx.cloud.database()
		db.collection('records').where({
			_openid: app.globalData.globalOpenId
		}).get({
			success: res => {
				console.log('yeah!')
        console.log('[onLoad] [查询] 成功: ', res)
        app.globalData.resLength = res.data.length //此用户在数据库中的数据条目数
        app.globalData.docId = res.data.length == 0 ? '' : res.data[0]._id
			},
			fail: err => {
				console.error('[onLoad] [查询] 失败：', err)
			}
		})
  },
  cancel: function(){
    wx.switchTab({
      url: '../setRecord/setRecord',
    })
  }

})