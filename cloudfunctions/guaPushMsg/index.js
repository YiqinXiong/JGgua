// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
	// API 调用都保持和云函数当前所在环境一致
	env: cloud.DYNAMIC_CURRENT_ENV
})

// 获取数据库信息
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	// 经期提醒模板id和经期结束提醒模板id
	const tmplID = ['MHOvPKqWjA2lwCMUyQ7kv_6v-PplmnVvoTgzMxR5Dm4', 'iR9X1sDnvalF-m175DI2Rv9tGSpzpwNdXt40gCj2SUU']
	// 0.准备好任务队列
	const timingTask = []
	// 1.获取数据库中的timingTask
	const res0 = await db.collection('timingTask0').get()
	const resData0 = res0.data
	console.log('resData0:', resData0)
	const res1 = await db.collection('timingTask1').get()
	const resData1 = res1.data
	console.log('resData1:', resData1)
	// 2. 将到时间的task入队列
	let now = new Date()
	try {
		for (let i = 0; i < resData0.length; i++) {
			let execTime0 = new Date(resData0[i].preComeDate)
			execTime0.setDate(execTime0.getDate() - 3) //提前3天提醒
			console.log('now Date() and execTime0 - 3 Date():', now, execTime0)
			if (execTime0 <= now) { //判断是否已经过了任务触发时间
				timingTask.push({
					tmplId: tmplID[0],
					openId: resData0[i].openid,
					data: {
						date1: {
							value: resData0[i].preComeDate
						},
						thing2: {
							value: '姨妈快来啦，少吃生冷多休息呀，抱抱'
						}
					}
				}); //存入任务队列
				// 数据库中删除该任务
				await db.collection('timingTask0').doc(resData0[i]._id).remove()
			}
		}
		console.log('timingTask', timingTask)
		for (let i = 0; i < resData1.length; i++) {
			let execTime1 = new Date(resData1[i].preEndDate)
			console.log('now Date() and execTime1 Date():', now, execTime1)
			if (execTime1 <= now) { //判断是否已经过了任务触发时间
				timingTask.push({
					tmplId: tmplID[1],
					openId: resData1[i].openid,
					data: {
						thing1: {
							value: resData1[i].nickName
						},
						time2: {
							value: resData1[i].preEndDate
						},
						thing3: {
							value: '姨妈好像要走了！记得去记录一下噢！'
						}
					}
				}); //存入任务队列
				// 数据库中删除该任务
				await db.collection('timingTask1').doc(resData1[i]._id).remove()
			}
		}
		console.log('timingTask', timingTask)
	} catch (e) {
		console.error(e)
	}
	// 3.处理待执行任务
	for (let i = 0; i < timingTask.length; i++) {
		let task = timingTask[i];
		console.log('task:', task)
		try {
			await cloud.openapi.subscribeMessage.send({
				touser: task.openId,
				templateId: task.tmplId,
				page: 'pages/about/about',
				data: task.data,
				// 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
				miniprogramState: 'formal'
			})
		} catch (e) {
			console.error(e)
		}
	}
	return {
		event
	}
}