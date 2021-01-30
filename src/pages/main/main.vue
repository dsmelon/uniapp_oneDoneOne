<template>
	<block>
		首页
		<button @click="jump">异步api和测试</button>
	</block>
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

</style>
