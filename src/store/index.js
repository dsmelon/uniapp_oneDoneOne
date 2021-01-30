import Vue from 'vue'
import Vuex from 'vuex'
import global from '@/store/global'

Vue.use(Vuex)
export default new Vuex.Store({
	modules: {
		global,
	}
})