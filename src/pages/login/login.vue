<template>
	<view class="page">
		<button @click="login" type="primary">使用微信登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		},
		methods: {
			async login(){
				const { dispatch } = this.$store
				await dispatch("global/login", {
					appid: "wx02b7db3bf6e224e6",
					secret: "8aa65d139330f63bfa654ff33e226b2c",
					grant_type: "client_credential"
				})
				getApp().globalData.autoLoginMark = true
				uni.setStorageSync("autoLoginMark", true)
				getApp().globalData.jump(undefined, "navigateBack")
			}
		},
		onUnload(){
			getApp().globalData.loginEnd()
		}
	}
</script>

<style lang="scss" scoped>
.page{
	padding: 40rpx 36rpx 0;
}
</style>
