
let ready = false

export const yourSdk = {
	ready(cb){
		setTimeout(() => {
			ready = true
			cb && cb()
		}, 3000)
	},
	act(string){
		uni.showModal({
			content: ready ? "我执行了" + string + "动作" : "sdk未准备好",
			showCancel: false
		})
	},
	act2(){
		uni.showModal({
			content: ready ? "我执行了act2动作" : "sdk未准备好",
			showCancel: false
		})
	}
}

//假设以上就是sdk,真正的时候是导入你的sdk，以下是加壳封装，不必每次嵌套ready回调，也不用等待回调完毕再打开应用，只会消耗用户的生命

let wait
function _ready(){
	if(wait) return wait
	wait = new Promise(r => yourSdk.ready(r))
	return wait
}

_ready()

export default async function sdk(key, ...other){
    await _ready();
    return typeof(yourSdk[key]) === "function" ? yourSdk[key](...other) : yourSdk[key]
}