// miniprogram/pages/about/about.js
const app = getApp()

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
		},

		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function (options) {
			// 获取登陆状态
			if (!app.globalData.logged) {
				wx.getSetting({
					success: res => {
						if (res.authSetting['scope.userInfo']) {
							// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
							app.globalData.logged = true
						}
					}
				})
			}

			// 播放背景音乐
			this.playMusic()
		},

		/**
		 * 生命周期函数--监听页面初次渲染完成
		 */
		onReady: function () {

		},

		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow: function () {

		},

		/**
		 * 生命周期函数--监听页面隐藏
		 */
		onHide: function () {

		},

		/**
		 * 生命周期函数--监听页面卸载
		 */
		onUnload: function () {

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

		},

		// 背景音乐播放
		playMusic: function () {
			player()

			function player() {
				back.title = 'All about us'
				back.src = url('https://qdct02.baidupcs.com/file/4bd74a7f6227e7a18d5b4ac65a7b902c?bkt=en-0f64e6ca9b24f0bcc518441d459a00b0254b238b0eeda79388b5da3d4701b3541fc147902e3d386e174ee01e9b0ef0a7f6a9e757f0fd233757a321ac4a1bb0e5&fid=2919466913-250528-1116532663480768&time=1589959503&sign=FDTAXUGERLQlBHSKfW-DCb740ccc5511e5e8fedcff06b081203-hV9BnF62yHQLbS9rSDa8GLTEl4A%3D&to=91&size=3306424&sta_dx=3306424&sta_cs=1456&sta_ft=mp3&sta_ct=7&sta_mt=7&fm2=MH%2CYangquan%2CAnywhere%2C%2Cjiangxi%2Cct&ctime=1531718166&mtime=1540877253&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=3306424&vuk=1146031382&iv=0&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-90ee6d57811ab6102c5608a91ce8769781797ac4240425eeea79776be3890d6c09582c59238895482ef177d3c24e0efed35816492ac2b7ce305a5e1275657320&sl=76480590&expires=8h&rt=sh&r=778606753&vbdid=2990663313&fin=he+is+we-all+about+us.mp3&fn=he+is+we-all+about+us.mp3&rtype=1&dp-logid=3261893984811760159&dp-callid=0.1&hps=1&tsl=80&csl=80&fsl=-1&csign=omJW1sNLplGzzZLaaOy73gy%2BB%2Fo%3D&so=0&ut=6&uter=4&serv=0&uc=3179540650&ti=8f692c02a37bcacce4586affcacfcbfbd3161c4f88690f1d&hflag=30&adg=c_bae703930c32c3989bd2090de5bdb020&reqlabel=250528_f_c6e83118d97752f2c5414f41c5851059_-1_6aa92b5151098b0bb181e71cb1ecccd6&by=themis')
				console.log('播放音乐')
				back.onEnded(() => {
					player()
				})
			}
		}
	}
})