// miniprogram/pages/about/about.js
var app = getApp()

const back = wx.getBackgroundAudioManager()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo: {},
		userProfile: {
			title1: '1. 为什么是gua经理',
			introduction1: '\tgua出自“呱gua儿”，这个可爱到冒泡的昵称的主人当然就是我的宝贝刘庭华啦，经理就是（月）经（管）理哈哈哈哈哈哈，所以说这个小程序就是熊老板出品的专为我的宝贝老婆记生理期的小工具~',
			title2: '2. 怎么让gua经理为我服务',
			introduction2: '\t这么简单的问题怎么难得倒我聪明伶俐的宝贝呢？首先选择第二个选项卡“设置历史经期”，是不是空空如也？点击那个粉色的加号就可以填写历史经期了，它长这么可爱当然因为是我手绘的。如果宝贝贪玩的话可以试试拖动这个粉色的加号，是不是很神奇，宝贝可以对它随心所欲，为所欲为。\n\t如果宝贝不记得历史生理期的话，我帮你记着呢，来问我来问我！每一条记录都可以点右上角的红叉叉进行删除。各条记录会按时间顺序自动进行排序，所以你发现它们顺序自动变了的时候不要惊讶噢，这不是闹鬼的恐怖，而是算法的浪漫！\n\t填完历史经期之后，就能自动给出平均周期、平均拜访时长等统计信息，还提供了答应宝贝的经期预测功能，鼓掌，撒花！',
			title3: '3. gua经理还有什么功能',
			introduction3: '\t看着这一个个的经期记录，是不是感觉眼花缭乱、四肢无力、眼前发黑、浑身难受？这个时候，一个可视化的日历救宝贝于水火之中！设置好历史经期之后，就可以去日历页查看历史经期了，预测经期也在日历中标出来了噢。\n\t之前我做“市场调研”的时候发现成熟的大姨妈APP还会有排卵日和安全期的标注，但是因为时间关系（我太菜了……），就留待下一次实现吧。\n\t日历切换月份除了用上方的按钮，还可以直接左右滑动屏幕噢，宝贝可以试试看！还增加了一个很重要的功能是运动打卡功能，Keep冲冲冲！',
			title4: '4. 刘庭华，我爱你！',
			introduction4: '\t昨天是我们成为恋人一百天的日子，今天可是二十万年一遇的大日子（下一个大日子那不得是202020.5.20吗哈哈哈哈哈哈哈），接连两天我都收到了宝贝带给我的精心准备的惊喜和幸福，幸福指数已然溢出。\n\t虽然和宝贝准备的相比，我这个小礼物算不上好用也不能说好看，但是我实现这个构想的过程应该是宝贝愿意看到的吧，能够从焦虑的快节奏生活中把碎片时间东拼西凑出来，为了宝贝，静下心从0开始学习一门新技术，我在这个过程中也感觉很快乐，同时也实打实地学到了知识。过去的一百天，我们算了算，大概是一辈子的三百分之一，如果可以，我想我们一起填满剩下的299份，然后一起开启千年副本！用什么填呢，当然是爱。\n\t想你，爱你，愿余生有你。',
			title5: '5. 咱们一周年啦！',
			introduction5: '\t上面那一条是写在2020年5月20日的，当时咱们才相恋100天，现在这个时间跨度已经拉长到365天，从此我们的路要用年这个单位来计算啦！\n\t在一周年的契机下，没能把我做的吃的带给你，礼物也还没做好，那只能回归我的老本行，把gua经理的功能扩充完善一下。（可不是偷懒，这几天我肝爆了！\n\t让我们来回味一下你提的需求：首先是把计算均值的范围调整到12个月以内，然后是要新增一个页面查看表格状的历史记录，再就是将运动打卡功能从开关改成按钮来支持一天多次打卡。其实还有一个最早提出的需求，是和你一起逛校园的时候你说的，就是增加小程序消息推送的功能，没想到我一直记着你却给忘了，哈哈哈哈哈猪呱呱。\n\t上述需求呢，除了运动打卡功能的修改之外，全部都实现了，还实现了你临时提出的“在表格中查看每两次姨妈间隔”的需求（临时加需求不愧是你啊。除了那些优化的内容之外，以后gua经理会在来姨妈3天前发推送提醒你注意饮食和休息，以及会在姨妈结束之后及时提醒你回到gua经理里面做好记录，这个功能真是废了半条命才实现的，技术相关的就不展开说了。\n\t恍惚之间我们已经走了一年，热烈依旧，挚爱依旧，每天都爱着对方，这是最好的状态，也是我们一年来的日常了。\n\t最后的最后，gua经理会一直更新（因为还有需求，而且可能会有很多未知bug···），正如我会一直在你身边，爱你呀，一周年快乐！',
		},
	},

	// 循环播放音乐
	playMusic: function () {
		console.log('[playMusic] 播放音乐')
		play()
		function play() {
			console.log('[playMusic] 播放音乐')
			back.title = 'I\'m Yours'
			// 音乐的mp3文件上传在自己的阿里云对象存储OSS中，链接从阿里云控制台复制得到
			back.src = 'https://xyq6785665.oss-cn-shenzhen.aliyuncs.com/music/Jason%20Mraz%20-%20I%27m%20Yours.mp3'
			console.log('播放音乐')
			back.onEnded(() => {
				play()
			})
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function () {
		console.log('[onLoad]')
		// 获取用户信息
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							console.log('[onLoad] [getUserInfo]:', res)
							app.globalData.logged = true
							app.globalData.globalUserInfo = res.userInfo
						}
					})
					// 已经授权，调用云函数 login 获取 openid
					wx.cloud.callFunction({
						name: 'login',
						complete: res => {
							console.log('[onLoad] [getOpenId]:', res.result.openid)
							app.globalData.globalOpenId = res.result.openid
						}
					})
				}
			}
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		console.log('[onReady]')
		// 播放背景音乐
		this.playMusic()
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		console.log('[onShow]')
		back.play()
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
		console.log('onHide')
		back.pause()
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		console.log('[onUnload]')
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})