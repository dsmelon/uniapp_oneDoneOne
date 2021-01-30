<template>
	<block>
		<text>登录后会显示用户信息，未登录会给出登录按钮</text>
		<view>注意：未登录点击登录时，要发起请求，而不是做登录行为，登录行为无法主动更新数据，若无需更新数据，可直接getApp().globalData.login()去登录</view>
		<login-view @login="login">
			<view class="red">{{userInfo.nickName}}</view>
			<view class="red">{{userInfo.phone}}</view>
		</login-view>
		<button @click="exit" v-if="isLogin">退出</button>
	</block>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		computed: {
			...mapState("global", {
				userInfo: store => store.userInfo,
				isLogin: store => store.isLogin
			})
		},
		data() {
			return {
				
			};
		},
		methods: {
			login(){
				const { dispatch } = this.$store
				dispatch("global/getUserInfo")
			},
			exit(){
				getApp().globalData.exitLogin()
			}
		},
		async onLoad() {
			const { dispatch } = this.$store
			dispatch("global/getUserInfo")
		}
	}
</script>

<style lang="scss" scoped>
 .red{
	 color: red;
 }
</style>
