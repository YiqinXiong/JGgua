var app = getApp()

const conf = {
	data: {
		calendarConfig: {
			multi: false, // 是否开启多选,
			theme: 'elegant', // 日历主题，目前共两款可选择，默认 default 及 elegant，自定义主题在 theme 文件夹扩展
			showLunar: true, // 是否显示农历，此配置会导致 setTodoLabels 中 showLabelAlways 配置失效
			inverse: false, // 单选模式下是否支持取消选中,
			chooseAreaMode: false, // 开启日期范围选择模式，该模式下只可选择时间段
			markToday: '今', // 当天日期展示不使用默认数字，用特殊文字标记
			defaultDay: false, // 默认选中指定某天；当为 boolean 值 true 时则默认选中当天，非真值则在初始化时不自动选中日期，
			highlightToday: true, // 是否高亮显示当天，区别于选中样式（初始化时当天高亮并不代表已选中当天）
			takeoverTap: false, // 是否完全接管日期点击事件（日期不会选中），配合 onTapDay() 使用
			preventSwipe: false, // 是否禁用日历滑动切换月份
			// firstDayOfWeek: 'Mon', // 每周第一天为周一还是周日，默认按周日开始
			onlyShowCurrentMonth: true, // 日历面板是否只显示本月日期
			hideHeadOnWeekMode: false, // 周视图模式是否隐藏日历头部
			showHandlerOnWeekMode: true, // 周视图模式是否显示日历头部操作栏，hideHeadOnWeekMode 优先级高于此配置
			disableMode: { // 禁用某一天之前/之后的所有日期
				type: 'after', // [‘before’, 'after']
				date: false, // 无该属性或该属性值为假，则默认为当天
			},
		},
		showDayDetail: false,
		curYear: 0,
		curMonth: 0,
		curDay: 0,
		curCarded: false,
		card_record: [],
		tips_record: [],
		pageReady: false,
		tipsContent: ''

	},
	afterTapDay(e) {
		console.log('afterTapDay', e.detail);
		// 未被选择
		var y = e.detail.year
		var m = e.detail.month
		var d = e.detail.day
		var card_record = this.calendar.getTodoLabels()
		var carded = this.inDateList(y, m, d, card_record)
		var tiped = this.inDateList(y, m, d, this.data.tips_record)
		if (!e.detail.choosed) {
			this.setData({
				showDayDetail: true,
				curYear: e.detail.year,
				curMonth: e.detail.month,
				curDay: e.detail.day,
				curCarded: carded == -1 ? false : true,
				tipsContent: tiped == -1 ? '' : this.data.tips_record[tiped].content
			})
		}
		// 已被选择
		else {
			// 取消全部点选
			const dates = [{
				year: e.detail.year,
				month: e.detail.month,
				day: e.detail.day
			}]
			this.calendar.cancelSelectedDates(dates)
			//取消Detail显示
			this.setData({
				showDayDetail: false
			})
		}

		console.log('[afterTapDate] showDayDetail:', this.data.showDayDetail)
	},
	whenChangeMonth(e) {
		console.log('whenChangeMonth', e.detail);
	},
	whenChangeWeek(e) {
		console.log('whenChangeWeek', e.detail);
	},
	onTapDay(e) {
		console.log('onTapDay', e.detail);
	},
	/***** 日历渲染完成后执行 */
	afterCalendarRender(e) {
		console.log('afterCalendarRender', e);
		// 在日历中填入历史经期、预测经期、打卡信息
		var obj = app.globalData.globalObj
		var objLength = obj.length
		var avgDuration = app.globalData.avgDuration

	},
	/***** 向日历中填入历史经期 */
	insertHistory: function () {
		//填入历史经期
		console.log('insertHistory.....')
		var obj = app.globalData.globalObj
		var objLength = obj.length
		const toSet = []
		var i = 0
		for (; i < objLength; i++) {
			var comeDate = obj[i].comeDate
			var duration = obj[i].duration
			var j = 0
			var dd = new Date(comeDate)
			for (; j < duration; j++) {
				var newday = new Date(comeDate)
				newday.setDate(dd.getDate() + j)
				var y = newday.getFullYear()
				var m = newday.getMonth() + 1
				var d = newday.getDate()
				console.log(y, m, d)
				// 页面 js 文件
				toSet.push({
					year: y,
					month: m,
					day: d,
					class: 'history-date' // 页面定义的 class，多个 class 由空格隔开
				})
			}
		}
		this.calendar.setDateStyle(toSet);
	},
	/***** 向日历中填入预测经期 */
	insertPredict: function () {
		//填入预测经期
		console.log('insertPredict.....')
		var preComeDate = app.globalData.preComeDate
		var avgDuration = app.globalData.avgDuration
		const toSet = []

		var j = 0
		for (; j < avgDuration; j++) {
			var newday = new Date(preComeDate)
			newday.setDate(newday.getDate() + j)
			var y = newday.getFullYear()
			var m = newday.getMonth() + 1
			var d = newday.getDate()
			console.log(y, m, d)
			// 页面 js 文件
			toSet.push({
				year: y,
				month: m,
				day: d,
				class: 'predict-date' // 页面定义的 class，多个 class 由空格隔开
			})
		}
		this.calendar.setDateStyle(toSet);
	},
	onSwipe(e) {
		console.log('onSwipe', e);
	},
	/***** 显示msg消息到提示框，持续1.5s */
	showToast(msg) {
		if (!msg || typeof msg !== 'string') return;
		wx.showToast({
			title: msg,
			icon: 'none',
			duration: 1500
		});
	},
	/***** 页面Hide时执行，页面周期函数在组件js中的pageLifetime中设置 */
	onHide: function () {
		console.log('onHide')
		// 只有登陆后才保存到云端
		if (getApp().globalData.logged) {
			const db = wx.cloud.database()
			// 若条目为0说明不曾有数据，则使用add，否则使用update
			if (app.globalData.resLength == 0) {
				db.collection('records').add({
					data: {
						one_user_record: [],
						card_record: this.calendar.getTodoLabels(),
						tips_record: this.data.tips_record
					},
					success: res => {
						// 修改全局变量docId（记录编号）和resLength（记录条目数）
						app.globalData.docId = res._id
						app.globalData.resLength = 1
					},
					fail: err => {
						console.error('[onHide] [新增] 失败：', err)
					}
				})
			} else {
				db.collection('records').doc(app.globalData.docId).update({
					data: {
						card_record: this.calendar.getTodoLabels(),
						tips_record: this.data.tips_record
					},
					success: res => {
						console.log('[onHide] [更新] 成功：', res)
					},
					fail: err => {
						console.error('[onHide] [更新] 失败：', err)
					}
				})
			}
		}
	},
	/***** 页面onUnload时执行，页面周期函数在组件js中的pageLifetime中设置 */
	onUnload: function () {
		console.log('onUnload')
		// 只有登陆后才保存到云端
		if (getApp().globalData.logged) {
			const db = wx.cloud.database()
			// 若条目为0说明不曾有数据，则使用add，否则使用update
			if (app.globalData.resLength == 0) {
				db.collection('records').add({
					data: {
						one_user_record: [],
						card_record: this.calendar.getTodoLabels(),
						tips_record: this.data.tips_record
					},
					success: res => {
						// 修改全局变量docId（记录编号）和resLength（记录条目数）
						app.globalData.docId = res._id
						app.globalData.resLength = 1
					},
					fail: err => {
						console.error('[onUnload] [新增] 失败：', err)
					}
				})
			} else {
				db.collection('records').doc(app.globalData.docId).update({
					data: {
						card_record: this.calendar.getTodoLabels(),
						tips_record: this.data.tips_record
					},
					success: res => {
						console.log('[onUnload] [更新] 成功：', res)
					},
					fail: err => {
						console.error('[onUnload] [更新] 失败：', err)
					}
				})
			}
		}
	},
	/***** 页面onLoad时执行，页面周期函数在组件js中的pageLifetime中设置 */
	onLoad: function () {
		// 登录了则直接加载云端数据
		console.log('app.globalData.resLength:', app.globalData.resLength)
		if (getApp().globalData.logged && app.globalData.resLength > 0) {
			// 查询数据并填入card_record和tips_record中
			var that = this
			const db = wx.cloud.database()
			db.collection('records').where({
				_id: app.globalData.docId
			}).get({
				success: res => {
					var card_record = res.data[0].card_record
					this.calendar.setTodoLabels({
						// 待办点标记设置
						pos: 'bottom', // 待办点标记位置 ['top', 'bottom']
						dotColor: 'purple', // 待办点标记颜色
						circle: false, // 待办圆圈标记设置（如圆圈标记已签到日期），该设置与点标记设置互斥
						showLabelAlways: true, // 点击时是否显示待办事项（圆点/文字），在 circle 为 true 及当日历配置 showLunar 为 true 时，此配置失效
						days: card_record
					});
					that.setData({
						tips_record: res.data[0].tips_record
					})
					console.log('res:', res)
				},
				fail: err => {
					console.error('[afterCalendarRender] [查询] 失败：', err)
				}
			})
		}
	},
	/***** 页面onShow时执行，页面周期函数在组件js中的pageLifetime中设置 */
	onShow: function () {
		console.log('onShow,pageReady?', this.data.pageReady)
		if (this.data.pageReady) {
			console.log(app.globalData.globalObj)
			this.insertHistory()
			this.insertPredict()
		}
	},
	/***** 页面onReady时执行，页面周期函数在组件js中的pageLifetime中设置 */
	onReady: function () {
		console.log('onReady')
		if (!this.data.pageReady) {
			console.log(app.globalData.globalObj)
			this.insertHistory()
			this.insertPredict()
		}
		this.setData({
			pageReady: true
		})
	},
	/***** 拨动开关 */
	switchChange: function (e) {
		console.log('switchChange', e)
		// 打卡
		if (e.detail.value) {
			this.calendar.setTodoLabels({
				// 待办点标记设置
				pos: 'bottom', // 待办点标记位置 ['top', 'bottom']
				dotColor: 'purple', // 待办点标记颜色
				circle: false, // 待办圆圈标记设置（如圆圈标记已签到日期），该设置与点标记设置互斥
				showLabelAlways: true, // 点击时是否显示待办事项（圆点/文字），在 circle 为 true 及当日历配置 showLunar 为 true 时，此配置失效
				days: [{
					year: this.data.curYear,
					month: this.data.curMonth,
					day: this.data.curDay,
					// todoText: '待办',
					// color: '#f40' // 单独定义待办颜色 (标记点、文字)
				}]
			});
		}
		// 取消打卡
		else {
			this.calendar.deleteTodoLabels([{
				year: this.data.curYear,
				month: this.data.curMonth,
				day: this.data.curDay
			}]);
		}
	},
	/***** 生成所需保存到云数据库的数据 */
	makeSaveData: function () {
		var card_days = this.calendar.getTodoLabels()
		console.log(card_days)
		console.log(this.inDateList(2020, 5, 18, card_days))


	},
	/***** 查看日期是否在dateList中，不在返回-1，否则返回index */
	inDateList: function (y, m, d, dateList) {
		var i = 0
		for (; i < dateList.length; i++) {
			if (dateList[i].year == y && dateList[i].month == m && dateList[i].day == d)
				return i
		}
		return -1
	},
	/***** 输入文本时更新文本框内的值 */
	inputing: function (e) {
		//输入文本
		this.setData({
			tipsContent: e.detail.value
		});
	},
	/***** 输入完成后的动作 */
	finishInput: function (e) {
		console.log('finishInput', e)
		var temp = this.data.tips_record
		var index = this.inDateList(this.data.curYear, this.data.curMonth, this.data.curDay, temp)
		if (index != -1) {
			temp[index].content = this.data.tipsContent
		} else {
			temp.push({
				year: this.data.curYear,
				month: this.data.curMonth,
				day: this.data.curDay,
				content: this.data.tipsContent
			})
		}
		this.setData({
			tips_record: temp
		})
	}

};

Page(conf);