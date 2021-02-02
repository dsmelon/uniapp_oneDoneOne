<template>
	<view>
		<button v-if="!isLogin" @click="login" type="primary">去登录</button>
		<slot v-else></slot>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		name: "LoginView",
		computed: {
			...mapState("global", {
				isLogin: store => store.isLogin
			})
		},
		methods: {
			login() {
				getApp().globalData.isLoginReturn = false
				this.$emit("login")
			}
		}
	}
</script>
