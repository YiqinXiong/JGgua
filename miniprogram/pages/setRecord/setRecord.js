// miniprogram/pages/test/test.js

/**
 * 设置模块
 **/

import util from '../../utils/util.js';
import apis from '../../utils/apis.js';
import {
	startDate
} from '../../utils/const.js';

const app = getApp()

Page({

	data: {
		obj: [], //记录历史姨妈的数组
		tempLength: 0, //实际填写完成的条目数
		avgDuration: 0, //平均姨妈持续天数
		avgInterval: 0, //平均姨妈周期
		preComeDate: '', //预测下次姨妈拜访时间
		recordId: '', //数据库中的记录的id
		resLength: 0, //查询结果的条目数，初始为0
		// openId: '',
		docId: '',
		startDate: startDate,
		endDate: util.getCurrentDay(),
		objChanged: false
	},

	/***** 获取openid */
	getOpenId() {
		// wx.cloud.callFunction({
		// 	name: 'login',
		// 	complete: res => {
		// 		console.log('[getOpenId] openid: ', res.result.openid)
		// 		this.setData({
		// 			openId: res.result.openid
		// 		})
		// 	}
		// })
	},
	/***** 页面初次加载时读取数据库数据 */
	onLoad: function () {
		// if (app.globalData.globalOpenId) {
		// 	this.setData({
		// 		openId: app.globalData.globalOpenId
		// 	})
		// }
		if (app.globalData.docId) {
			this.setData({
				docId: app.globalData.docId
			})
		}

		console.log('app.globalData.resLength:', app.globalData.resLength)
		if (app.globalData.resLength > 0) {
			// 查询数据并填入obj中
			var that = this
			const db = wx.cloud.database()
			db.collection('records').where({
				_id: app.globalData.docId
			}).get({
				success: res => {
					that.setData({
						obj: res.data[0].one_user_record
					})
					console.log('res:', res)
				},
				fail: err => {
					console.error('[onLoad] [查询] 失败：', err)
				}
			})
		}

	},
	/***** 页面初次渲染完成，统计Avg值，给出预测值 */
	onReady: function () {
		this.timeCounter()
	},
	/***** 页面隐藏时存储数据到数据库 */
	onHide: function () {
		if (this.data.objChanged) {
			wx.showModal({
				title: '喂，这位仙女请留步',
				content: '回去保存一下再走？',
				success: function (res) {
					if (res.confirm) {
						console.log('宝贝点击了确定按钮')
						wx.switchTab({
							url: '../setRecord/setRecord',
						})
					}
				}
			})
		}
	},
	/***** 页面卸载时存储数据到数据库 */
	onUnload: function () {
		if (this.data.objChanged) {
			wx.showModal({
				title: '喂，这位仙女请留步',
				content: '真的不保存一下再走嘛？',
				success: function (res) {
					if (res.confirm) {
						console.log('宝贝点击了确定按钮')
						wx.switchTab({
							url: '../setRecord/setRecord',
						})
					}
				}
			})
		}
	},
	/***** 增加卡片 */
	onTapAdd: function (e) {
		if (!app.globalData.logged) {
			wx.navigateTo({
				url: '../index/index',
			})
		} else {
			var temp = this.data.obj;
			temp.push({
				index: this.data.obj.length,
				comeDate: '',
				goDate: '',
				duration: -1,
				isComeFinished: false,
				isGoFinished: false
			});
			this.setData({
				obj: temp,
				objChanged: true
			})
		}

	},
	/***** 删除卡片 */
	onTapDelete: function (e) {
		console.log("deleteCard: ", e)
		var temp = this.data.obj;
		var deleteIndex = e.currentTarget.dataset.curindex
		temp.splice(deleteIndex, 1)
		this.setData({
			obj: temp,
			objChanged: true
		})
	},
	/***** 保存修改 */
	onTapSave: function (e) {
		const db = wx.cloud.database()
		// 若条目为0说明不曾有数据，则使用add，否则使用update
		if (app.globalData.resLength == 0) {
			db.collection('records').add({
				data: {
					one_user_record: this.data.obj,
					card_record: [],
					tips_record: []
				},
				success: res => {
					wx.showToast({
						title: 'gua, 保存成功',
					})
					// 修改全局变量docId（记录编号）和resLength（记录条目数）
					app.globalData.docId = res._id
					app.globalData.resLength = 1
				},
				fail: err => {
					console.error('[onUnload] [新增] 失败：', err)
				}
			})
		} else {
			db.collection('records').doc(this.data.docId).update({
				data: {
					one_user_record: this.data.obj
				},
				success: res => {
					wx.showToast({
						title: 'gua, 保存成功',
					})
					console.log('[onUnload] [更新] 成功：', res)
				},
				fail: err => {
					console.error('[onUnload] [更新] 失败：', err)
				}
			})
		}
		this.setData({
			objChanged: false
		})
	},
	/***** 选择器选择时触发，将当前日期设置为选择到的日期 */
	bindPickerRecentChange_Come: function (e) {
		console.log(this.data.obj)
		var temp = this.data.obj;
		var curIndex = e.currentTarget.dataset.curindex
		console.log(curIndex)
		console.log('picker recent ', e.detail.value)
		// 检查走的日期是否大于到的日期
		if (temp[curIndex].isGoFinished && temp[curIndex].goDate < e.detail.value) {
			wx.showModal({
				title: '宝贝迷糊啦？',
				content: '大姨妈走的比到的还早？？？',
				success: function (res) {
					if (res.confirm) {
						console.log('宝贝点击了确定按钮')
					}
				}
			})
			return
		}
		temp[curIndex].comeDate = e.detail.value
		temp[curIndex].isComeFinished = true

		/***** 完成日期填写就按Come的日期排序 */
		if (temp[curIndex].isComeFinished && temp[curIndex].isGoFinished) {
			var comeDate = new Date(temp[curIndex].comeDate)
			var goDate = new Date(temp[curIndex].goDate)
			var duration = parseInt((goDate.getTime() - comeDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
			temp[curIndex].duration = duration

			function compare(property) {
				return function (a, b) {
					var value1 = a[property];
					var value2 = b[property];
					if (value1 > value2)
						return 1;
					else
						return -1;
				}
			}
			temp = temp.sort(compare('comeDate'))
		}
		this.setData({
			obj: temp,
			objChanged: true
		}) //this.hasFinished();
	},
	/***** 选择器选择时触发，将当前日期设置为选择到的日期 */
	bindPickerRecentChange_Go: function (e) {
		console.log(this.data.obj)
		var temp = this.data.obj;
		var curIndex = e.currentTarget.dataset.curindex
		console.log(curIndex)
		console.log('picker recent ', e.detail.value)
		// 检查走的日期是否大于到的日期
		if (temp[curIndex].isComeFinished && temp[curIndex].comeDate > e.detail.value) {
			wx.showModal({
				title: '宝贝迷糊啦？',
				content: '大姨妈走的比到的还早？？？',
				success: function (res) {
					if (res.confirm) {
						console.log('宝贝点击了确定按钮')
					}
				}
			})
			return
		}
		temp[curIndex].goDate = e.detail.value
		temp[curIndex].isGoFinished = true

		/***** 完成日期填写就按Come的日期排序 */
		if (temp[curIndex].isComeFinished && temp[curIndex].isGoFinished) {
			var comeDate = new Date(temp[curIndex].comeDate)
			var goDate = new Date(temp[curIndex].goDate)
			var duration = parseInt((goDate.getTime() - comeDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
			temp[curIndex].duration = duration

			function compare(property) {
				return function (a, b) {
					var value1 = a[property];
					var value2 = b[property];
					if (value1 > value2)
						return 1;
					else
						return -1;
				}
			}
			temp = temp.sort(compare('comeDate'))
		}
		this.setData({
			obj: temp,
			objChanged: true
		}) //this.hasFinished();
	},
	/***** 计算平均姨妈持续天数、平均姨妈周期 */
	countAvg: function () {
		var temp = this.data.obj
		// console.log('[countAvg] obj:', temp)
		var tempLength = temp.length
		var tempSumDuration = 0
		var tempSumInterval = 0
		var lastFinishedRecordIndex = -1
		var i = 0
		for (; i < temp.length; i++) {
			//不统计未完整填写的项
			if (!(temp[i].isComeFinished && temp[i].isGoFinished)) {
				tempLength--
				continue
			}
			lastFinishedRecordIndex = i
			var lastComeDate = ''
			var comeDate = new Date(temp[i].comeDate)
			var goDate = new Date(temp[i].goDate)
			var duration = parseInt((goDate.getTime() - comeDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
			// console.log('第', i, '个，持续天数为：', duration)
			if (duration >= 0) {
				tempSumDuration += duration
			}
			// 仅在i>0时统计两次经期的comeDate差距
			if (i > 0) {
				lastComeDate = new Date(temp[i - 1].comeDate)
				var interval = parseInt((comeDate.getTime() - lastComeDate.getTime()) / (1000 * 60 * 60 * 24));
				// console.log('第', i, '个和第', i - 1, '个的comeDate差距为：', interval)
				if (interval >= 0) {
					tempSumInterval += interval
				}
			}
		}

		var avgDuration = tempLength > 0 ? Math.round(tempSumDuration / tempLength) : 5
		var avgInterval = tempLength - 1 > 0 ? Math.round(tempSumInterval / (tempLength - 1)) : 28
		var preComeDate = ''
		if (lastFinishedRecordIndex != -1) {
			// dd为预测的日期，Date类型
			var dd = new Date(temp[lastFinishedRecordIndex].comeDate)
			dd.setDate(dd.getDate() + avgInterval)
			// console.log(dd)
			var y = dd.getFullYear();
			var m = dd.getMonth() + 1
			var d = dd.getDate()
			if (m < 10)
				m = '0' + m;
			if (d < 10)
				d = '0' + d
			// 将dd转为'yyyy-mm-dd'格式，赋值给preComeDate
			preComeDate = y + "-" + m + "-" + d
		}
		// console.log('avgDuration:', avgDuration)
		// console.log('avgInterval', avgInterval)
		// console.log('preComeDate:', preComeDate)
		this.setData({
			avgDuration: avgDuration,
			avgInterval: avgInterval,
			preComeDate: preComeDate,
			tempLength: tempLength
		})
		app.globalData.preComeDate = preComeDate
		app.globalData.avgDuration = avgDuration
	},
	/***** 定时（1000ms）计算和刷新Avg值 */
	timeCounter: function () {
		var that = this
		setTimeout(function () {
			console.log('定时运行一次countAvg...')
			app.globalData.globalObj = that.data.obj //定时更新全局变量obj
			that.countAvg()
			that.timeCounter()
		}, 1000)
	}
})