
import request from '@/server/request'

const api = {//下面接口真实环境应调自己后端接口，这里直接调用wx的接口,只简单转码模拟
    code2Session: data => request("/sns/jscode2session", {data, needWxLogin: false, needLogin: false, transform: res => ({code: 200, data: res})}),
	token: data => useOnceData(request, "/cgi-bin/token", {data, stop: true, needWxLogin: false, needLogin: false, transform: res => ({code: 200, data: res})}), //只允许点一次
	
	getUserInfo: data => request("/getUserInfo",{transform: res => ({code: 200, data: {
		nickName: "吴彦祖",
		phone: "13800138000"
	}})}),
	
	test: data => request("/test",{transform: res=>({code:402,data:"test"}), loginTip: "popu"}),
	
	//某个动作需要登录，但是并不需要发送接口，需要用下面这个api,成功码要对应自己的成功码
	loginNext: () => request(undefined, {transform: () => ({code: 200})})
}
export default api
//提供以下两个常用方法，使用第一次数据，使用最后一次数据

//使用最后一次数据，使用方法 useEndData(api.getInfo, data)
//即：api.xxx = data => useEndData(request, "/api/xxx", {data})
const abort = [];
export const useEndData = async (cb, ...params) => {
    let target = abort.findIndex(_=>_.key === cb)
    if(target > -1){
        abort[target].cancel()
    }else{
        abort.push({key: cb})
        target = abort.length - 1
    }
    const res = await Promise.race([cb(...params), new Promise((resolve) => {
        abort[target].cancel = () => resolve("__cancel__")
    })])
    if(res !== "__cancel__"){
        abort.splice(target, 1)
        return res
    }
    return new Promise(() => null)
}

//使用第一次数据，防止重点，使用方法同上，仅仅是一个接口周期，接口返回了之后仍然可以点击第二次
const stops = [];
export const useOnceData = async (cb, ...params) => {
    const target = stops.findIndex(_=>_.key === cb)
    if(target > -1) return new Promise(() => null)
    else stops.push({key: cb})
    const res = await cb(...params)
    stops.splice(target, 1)
    return res
}

//延迟方法，未操作时执行动作，通常用于用户输入框搜索自动查询的时候使用
export const delay = time => new Promise(_ => setTimeout(_, time))
// await useEndData(delay, 1000) 这样使用