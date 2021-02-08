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
		task0docId: '',
		task1docId: '',
		startDate: startDate,
		endDate: util.getCurrentDay(),
		objChanged: false,
		readOnly: false, //是否开启精简只读模式
		sizeList: [], //存储每一列最长的长度
		head: [{
			"key": "index",
			"name": "#"
		}, {
			"key": "comeDate",
			"name": "她来了"
		}, {
			"key": "goDate",
			"name": "她走了"
		}, {
			"key": "duration",
			"name": "持续"
		}, {
			"key": "interval",
			"name": "相距"
		}] //表头
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
	/***** 页面初次渲染完成，统计Avg值，给出预测值，测试timingTask条目 */
	onReady: function () {
		this.timeCounter()
		// 如果该用户没有timingTask条目，则进行初次创建
		const db = wx.cloud.database()
		var that = this
		db.collection('timingTask0').where({
			openid: app.globalData.globalOpenId
		}).get({
			success: function (res) {
				console.log(res.data)
				if (res.data.length == 0) {
					db.collection('timingTask0').add({
						data: {
							openid: app.globalData.globalOpenId,
							preComeDate: ''
						},
						success: res => {
							console.log(res)
							that.setData({
								task0docId: res._id
							})
						}
					})
				} else {
					console.log('res.data[0]._id', res.data[0]._id)
					that.setData({
						task0docId: res.data[0]._id
					})
				}
			}
		})
		db.collection('timingTask1').where({
			openid: app.globalData.globalOpenId
		}).get({
			success: function (res) {
				console.log(res.data)
				if (res.data.length == 0) {
					db.collection('timingTask1').add({
						data: {
							openid: app.globalData.globalOpenId,
							preEndDate: '',
							nickName: ''
						},
						success: res => {
							console.log(res)
							that.setData({
								task1docId: res._id
							})
						}
					})
				} else {
					console.log('res.data[0]._id', res.data[0]._id)
					that.setData({
						task1docId: res.data[0]._id
					})
				}
			}
		})
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
	/***** 工具函数，给出日期preComeDate和天数duration，得到x天之后的日期 */
	getPreEndDate: function (preComeDate, duration) {
		// dd为预测的结束日期，Date类型
		var dd = new Date(preComeDate)
		dd.setDate(dd.getDate() + duration)
		// console.log(dd)
		var y = dd.getFullYear();
		var m = dd.getMonth() + 1
		var d = dd.getDate()
		if (m < 10)
			m = '0' + m;
		if (d < 10)
			d = '0' + d
		// 将dd转为'yyyy-mm-dd'格式，作为preEndDate返回
		return y + "-" + m + "-" + d
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

		// 最后订阅下一次的经期提醒
		const preComeDate = this.data.preComeDate
		const preEndDate = this.getPreEndDate(this.data.preComeDate, this.data.avgDuration)
		const userInfo = app.globalData.globalUserInfo
		const taskDocID = [this.data.task0docId, this.data.task1docId]
		console.log('taskDocID:', taskDocID)
		console.log(userInfo)
		wx.getSetting({
			withSubscriptions: true,
			success(res) {
				// console.log(res)
				const settingBeforeSubscribe = res.subscriptionsSetting
				// console.log(settingBeforeSubscribe)
				// res.subscriptionsSetting = {
				//   mainSwitch: true, // 订阅消息总开关
				//   itemSettings: {   // 每一项开关
				//     SYS_MSG_TYPE_INTERACTIVE: 'accept', // 小游戏系统订阅消息
				//     SYS_MSG_TYPE_RANK: 'accept'
				//     zun-LzcQyW-edafCVvzPkK4de2Rllr1fFpw2A_x0oXE: 'reject', // 普通一次性订阅消息
				//     ke_OZC_66gZxALLcsuI7ilCJSP2OJ2vWo2ooUPpkWrw: 'ban',
				//   }
				// }

				// 经期提醒模板id和经期结束提醒模板id
				const tmplID = ['MHOvPKqWjA2lwCMUyQ7kv_6v-PplmnVvoTgzMxR5Dm4', 'iR9X1sDnvalF-m175DI2Rv9tGSpzpwNdXt40gCj2SUU']
				// 只有当两个模板都已被推送，才订阅下一次推送
				wx.requestSubscribeMessage({
					tmplIds: tmplID,
					success(res) {
						console.log(res)
						db.collection('timingTask0').doc(taskDocID[0]).update({
							data: {
								preComeDate: preComeDate
							},
							success: res => {
								console.log(res)
							},
							fail: err => {
								console.error(err)
							}
						})
						db.collection('timingTask1').doc(taskDocID[1]).update({
							data: {
								preEndDate: preEndDate,
								nickName: userInfo.nickName
							},
							success: res => {
								console.log(res)
							},
							fail: err => {
								console.error(err)
							}
						})
					},
					fail(err) {
						console.error('requestSubscribeMessage调用失败', err);
					}
				})
			}
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
			//不统计近6个月以前的数据
			if (temp.length > 6 && i < (temp.length - 6)) {
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
			let threshold = (temp.length - 6) < 0 ? 0 : (temp.length - 6)
			// 仅在i > temp.length - 6时统计两次经期的comeDate差距
			if (i > threshold) {
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
	},
	/***** 拨动开关 */
	switchChange: function (e) {
		console.log('switchChange', e)
		this.setData({
			readOnly: e.detail.value
		})
		// 进入精简模式
		if (e.detail.value) {
			// 填写精简模式表格
			let sizeList = []; //存储每一列最长的长度
			let head = this.data.head
			let body = this.data.obj
			for (let curHead in head) {
				if (!(curHead > 0 && curHead < 4)) {
					sizeList[curHead] = head[curHead].name.length;
					continue;
				}
				for (let curLine in body) {
					// console.log(curHead, curLine)
					//初始化每一列的长度
					sizeList[curHead] = sizeList[curHead] || head[curHead].name.length;
					//得到每一列中 每一个单元格的内容
					let v = body[curLine][head[curHead].key] + "";
					//得到 \w 的长度
					let wSize = v.match(/[\w]/g) || "";
					//得到除上面之外的其他内容的长度
					let otherSize = v.length - wSize.length;
					//计算每一个单元格的长度
					let vSize = wSize.length * 0.5 + otherSize;
					//将最长的一个单元格放入数组中
					if (vSize > sizeList[curHead])
						sizeList[curHead] = vSize;
					// console.log(curHead, v, wSize, otherSize, vSize, sizeList[curHead])
				}
			}
			this.setData({
				sizeList: sizeList
			})
		}
	}
})