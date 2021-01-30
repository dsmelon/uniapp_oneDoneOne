
import api from "@/server/api"
export default {
	namespaced: true,
	state: {
		isLogin: !!uni.getStorageSync("token"),//与视图有关的登录请使用此变量自动更新，不宜使用!!getApp().globalData.token，任何时候都应该使用此变量来判断登录态
		userInfo: {}
	},
	actions: {
		isLogin({commit}, payload){
			commit("save", {isLogin: payload})
		},
		clearLogin({commit}){
			commit("save",{
				userInfo: {},
				isLogin: false
			})
		},
		async code2Session({ commit }, payload){
			const { data = {} } = await api.code2Session(payload)
			return data
		},
		async login({ commit }, payload){
			const { data = {} } = await api.token(payload)
			getApp().globalData.token = data.access_token
			getApp().globalData.isLoginReturn = false
			commit("save", { isLogin: true })
			uni.setStorageSync("token", data.access_token)
			getApp().globalData.loginEnd()
			return data
		},
		async getUserInfo({ commit }, payload){
			const { data = {} } = await api.getUserInfo(payload)
			commit("save", {userInfo: data})
		}
	},
	mutations: {
		save(store, payload){
			for(let i in payload) store[i] = payload[i]
		}
	}
}