<template>
	<view>
		<image class="logo" src="/static/logo.png" mode="widthFix"></image>
		<button @click="jump">去演示页面</button>
	</view>
</template>

<script>
	export default {
		methods: {
			jump(){
				getApp().globalData.jump("/otherPage/asyncApi/asyncApi")
			}
		}
	}
</script>

<style lang="scss">
.logo{
	width: 200rpx;
}
</style>
