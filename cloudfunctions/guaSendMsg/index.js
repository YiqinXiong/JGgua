// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 云函数入口函数
exports.main = async(event, context) => {
  console.log(event)
  return sendTemplateMessage(event)
}

// 推送模板消息
async function sendTemplateMessage(event) {
  const {
    OPENID
  } = cloud.getWXContext()

  const sendResult = await cloud.openapi.templateMessage.send({
    touser: OPENID,
    templateId,
    formId: event.formId,
    page: 'pages/index/index',
    data: {
      
    }
	})
	
  return sendResult
}
