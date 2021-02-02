import config from '@/config'
let logining = false //是否正在登录，防止接口并发引起多次登录
let timer = -1, loadingCount = 0
export default async function request(url, {
	header,
	method = "post",
	data,
	needWxLogin = true, 				// 是否需要微信登录
	needLogin = true,					// 是否需要登录
	stop = false,						// 出错是否阻断代码
	successCode = [200],				// 成功码
	loginCode = [400, 401, 402],		// 登录过时码
	loginTip = "popu",					// 登录提醒方式，可以为false,popu,tip,对应，不提示，弹窗去登录，toast提示
	transform,							// 数据转换函数
	delay = false,						// 延时多久出现loading,可以为数字毫秒，或例{time: 200,desc: '加载中'}
	isTip = true,						// 出错是否提示,这里只写toast,如果需要弹窗型的，可以改成对象的形式，把配置传进来用于操作弹窗的动作等
	replayCount = 2,					// 接口重发次数，防止新手代码写错死循环
	...other							// 其余请求配置
} = {}){
	const globalData = getApp().globalData
	if(globalData.isLoginReturn && needLogin) {
		switch(loginTip){
			case "popu":
				await globalData.gotoLogin()
			break
			case "tip": uni.showToast({ icon: "none", title: "请登录" })
			default: return Promise.reject()
		}
	}
	if(needWxLogin) await globalData.wxLogin()
	if(needLogin) await globalData.login()
	let delayTime = 200, delayDesc = "加载中···"
	if(delay){
		if(typeof delay === "number"){
			delayTime = delay
		}else{
			delayTime = delay.time || 200
			delayDesc = delay.desc || "加载中···"
		}
		loadingCount++
		if(timer < 0){
			timer = setTimeout(() => {
				loadingCount > 0 && uni.showLoading({ title: delayDesc, mask: true })
			}, delayTime)
		}
	}
	let { statusCode, data:res = {}, header:{ Date:date = new Date().valueOf() } = {} } = await new Promise(resolve => {
		if(!url) resolve({statusCode: 200})
		else uni.request({
			url: /^http/.test(url) ? url : `${config.host}${url}`,
			header:{
				"content-type": "application/x-www-form-urlencoded",
				...header
			},
			method,
			data: {
				...(needWxLogin ? {session: globalData.session} : undefined),
				...(needLogin ? {access_token: globalData.token} : undefined),
				...data
			},
			success: resolve,
			fail: resolve,
			...other
		})
	})
	if(delay){
		clearTimeout(timer)
		loadingCount--
		if(loadingCount <= 0) {
			timer = -1
			uni.hideLoading()
		}
	}
	if(transform) res = transform(res)
	res = {...res, serverTime: new Date(date)} // 把服务器时间返回给接口方便使用
	if(res.data === null) res.data = undefined // 让null也可以使用默认值解析
	if(+statusCode !== 200){
		res.code = -1
		res.message = "网络错误，请重试！"
	}
	const {code, message} = res
	if(successCode.some(_ => _ === +code)){
		return res
	}else if(loginCode.some(_ => _ === +code) && --replayCount){
		if(!logining) await globalData.exitLogin(false)
		logining = true
		if(needWxLogin) await globalData.wxLogin()
		if(needLogin) await globalData.login()
		logining = false // 如果有特别慢的接口，整个登录流程走完了之后才响应，比如超过10s以上的接口，这里的logining可以判断是true就延时一分钟设为false，影响不大
		return await request(url, {header, method, data, loginTip, needWxLogin, needLogin, stop, replayCount, isTip, transform, delay, ...other})
	}else{
		if(isTip && message) uni.showToast({
			icon: "none",
			title: message
		})
		if(stop) return Promise.reject()
		else return res
	}
}


//请仔仔细细揣摩本架构的精细之处
//1.登录过期后触发登录，登录完成后重发接口，并不需要做刷新登录前的页面的奇葩操作
//2.如果是onShow里发接口，登录返回时会重新触发，如果用户点击的是左上角的返回，此时拒绝了接口的请求，无需返回更新的页面使用onLoad即可
//3.本架构可以无感知登陆过期时自动登录，你不需要在你的页面做任何多余的操作，一切都是那么自然和谐