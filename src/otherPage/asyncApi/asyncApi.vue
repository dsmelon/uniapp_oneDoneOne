<template>
	<view>
		<text>使用方式sdk("key", params1, params2),如果需要返回值，则const res = await sdk(...)</text>
		<text>可以看到第一次延迟了，等待ready,之后调用再也不会延迟，因为ready已经执行完毕</text>
		<button @click="act1">执行act1</button>
		<button @click="act2">执行act2</button>
		<text>以下按钮是使用第一次数据和使用最后一次数据的例子,用在异步中</text>
		<button @click="once">使用第一次数据</button>
		<button @click="end">使用最后一次数据</button>
		<text>以下是模拟触发登录行为点击返回不登录，再次触发登录接口时的行为</text>
		<button @click="test">不登录调用登录接口</button>
		<text>如果需要使用token,或者说动作需要登录，但是并不需要发送接口之类的行为，而且运行到这里时整个程序都未曾触发过登录行为</text>
		<button @click="loginNext">登录后输出1，未登录需要先登录</button>
		<text>一秒内无输入会显示输入值,未操作时执行动作，通常用于用户输入框自动搜索查询的时候使用</text>
		<input v-model="input" placeholder="请输入" @input="delayNext"/>
		<text>{{text}}</text>
	</view>
</template>

<script>
	import sdk from '@/server/asyncsdk'
	import api, { useOnceData, useEndData, delay } from '@/server/api'
	export default {
		data(){
			return {
				input: "",
				text: "在这里显示"
			}
		},
		methods: {
			act1(){
				sdk("act", "abc")
			},
			act2(){
				sdk("act2")
			},
			async delay(){
				return await new Promise(r => setTimeout(r, 1000))
			},
			async once(){
				await useOnceData(this.delay)
				uni.showModal({
					content: "我使用第一次数据，之后点击无效",
					showCancel: false
				})
			},
			async end(){
				await useEndData(this.delay)
				uni.showModal({
					content: "我使用最后一次数据，之前点击被放弃",
					showCancel: false
				})
			},
			async test(){
				//接口并发也只会触发一次登录弹窗的提示
				api.test()
				api.test()
			},
			async loginNext(){
				await api.loginNext()
				uni.showModal({
					content: '1'
				})
			},
			async delayNext(){
				await useEndData(delay, 1000)
				this.text = this.input
			}
		}
	}
</script>

<style lang="scss">

</style>
