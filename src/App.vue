<script>
	import store from '@/store'
	import { stringify } from 'query-string'
    export default {
		globalData: {
			token: uni.getStorageSync("token"),//登录口令，注意，此登录状态要同步到store里一份，用到视图登录态时，从store里取，保证数据的实时性，这里已经实现，store.global.isLogin
			session: uni.getStorageSync("session"),//微信登录口令
			isLoginReturn: false,//是否在登录页点击了返回,默认和每次登录时设为是，登录后设为false
			autoLoginMark: uni.getStorageSync("autoLoginMark"),//是否自动登录，用户如果使用微信方式登录，过期后要自动无感知登录，主动退出后或者非微信登录方式要置为false
			autologining: false,//这个是防止自动登录的接口session过期引起的登录回调自己的问题，每个周期只能触发一次自动登录
			waitWxLogin: undefined,//微信登录等待的东西
			waitLogin: undefined,//登录等待的东西
			waitGotoLogin: undefined,// 提示登录等待的东西
			loginEnd: _ => _,//登录行为完成执行的函数，每次登录会重写此函数，用于监听登录行为的完成
			jump: function(url, type = "navigateTo"){//统一跳转方法，所有跳转都由此处，方便监听或者拦截
				if(type === "navigateBack"){
					return uni.navigateBack(url)
				}
				if(typeof(url) === "object"){
					const { url:urls, query, ...other } = url
					return uni[type]({
						url: `${urls}${query ? "?" + stringify(query, {encode: false, strict: false}) : ""}`,
						...other
					})
				}else{
					return uni[type]({url})
				}
			},
			login: function(){
				if(this.token) return Promise.resolve()
				if(this.waitLogin) return this.waitLogin
				else {
					this.waitLogin = new Promise(async (resolve, reject) => {
						if(this.autoLoginMark){
							await this.autoLogin()
							resolve()
						}else{
							this.isLoginReturn = true
							this.loginEnd = () => {
								if(this.isLoginReturn){
									this.waitLogin = undefined
									// 此处为自动下次触发登录，这里在login-view组件中处理了登录行为，不建议在此处做，如果页面onshow里有延迟发接口行为会继续触发登录,可能被认为强制登录
									// setTimeout(() => {
									// 	this.isLoginReturn = false
									// }, 200)
									reject()
								} else resolve()
							}
							this.jump("/pages/login/login")
						}
					})
					return this.waitLogin
				}
			},
			autoLogin: async function(){
				if(this.autologining) return
				this.autologining = true
				await store.dispatch("global/login", {
					appid: "wx02b7db3bf6e224e6",
					secret: "8aa65d139330f63bfa654ff33e226b2c",
					grant_type: "client_credential"
				})
				this.autologining = false
				return
			},
			wxLogin: function(){
				if(this.waitWxLogin) return this.waitWxLogin
				this.waitWxLogin = new Promise((resolve, reject) => {
					uni.checkSession({
						complete: ({errMsg}) => {
							if(/:ok$/.test(errMsg) && this.session){
								resolve()
							}else{
								uni.login({
									provider: 'weixin',
									complete: ({ code }) => {
										if(code){
											store.dispatch("global/code2Session", {
												appid: "wx02b7db3bf6e224e6",
												secret: "8aa65d139330f63bfa654ff33e226b2c",
												js_code: code,
												grant_type: "authorization_code"
											}).then(res => {
												this.openId = res.openid
												this.session = res.session_key
												this.unionId = res.unionid
												uni.setStorageSync("session", res.session_key)
												uni.setStorageSync("openId", res.openid)
												uni.setStorageSync("unionId", res.unionid)
												resolve()
											})
										}else{
											reject()
										}
									}
								})
							}
						}
					})
				})
				return this.waitWxLogin
			},
			gotoLogin: function(){
				if(this.waitGotoLogin) return this.waitGotoLogin
				this.waitGotoLogin = new Promise((resolve, reject) => {
					uni.showModal({
						title: "登录",
						confirmText: "去登录",
						complete: async res => {
							this.waitGotoLogin = undefined
							if(res.confirm){
								await this.login()
								resolve()
							}else reject()
						}
					})
				})
				return this.waitGotoLogin
			},
			exitLogin: function(clearAutoLoginMark = true){
				return new Promise(resolve => {
					store.dispatch("global/clearLogin")
					this.token = ""
					this.session = ""
					this.openId = ""
					this.unionId = ""
					this.waitLogin = undefined
					this.waitWxLogin = undefined
					this.waitGotoLogin = undefined
					this.isLoginReturn = false
					uni.setStorageSync("token", "")
					uni.setStorageSync("session", "")
					uni.setStorageSync("openId", "")
					uni.setStorageSync("unionId", "")
					if(clearAutoLoginMark){
						this.autoLoginMark = false
						uni.setStorageSync("autoLoginMark", false)
					}
					resolve()
				})
			}
		},
        onLaunch: function() {
            
        },
        onShow: function() {
            
        },
        onHide: function() {
            
        }
    }
</script>

<style lang="scss">
	*,view,page,button{
		box-sizing: border-box;
	}
    page{
		background-color: white;
		height: 100%;
	}
</style>
