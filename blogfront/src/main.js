import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 深色模式
import 'element-plus/theme-chalk/dark/css-vars.css'

import animated from 'animate.css'

import 'hover.css'
import '@/assets/js/common'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
/*引入公共样式*/
import '@/assets/css/reset.less'
import '@/assets/css/dark.less'
import "icepro/src/assets/common.less"
import icepro from 'icepro/index'
// markdown预览组件以及样式
import VueMarkdownEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
/*import Prism from 'prismjs'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'*/
// 显示行数
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index'
// 复制插件
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index'
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css'


// @date 2023/5/7 , @author icestone
// 引入所有语言包,管他妈的直接全部引入
// 引入全局组件:
import IndexHeader from '@/components/index/IndexHeader.vue'
import hljs from 'highlight.js'

console.log('icepro--->')
console.log(icepro)


// @date 2023/5/6 , @author icestone
// 编辑的组件
// 第一种:
VueMarkdownEditor.use(githubTheme, {
    Hljs: hljs
})
/*VueMarkdownEditor.use(vuepressTheme, {
    Prism
})*/

VueMarkdownEditor.use(createLineNumbertPlugin())
VueMarkdownEditor.use(createCopyCodePlugin())

const app = createApp(App)
// @date 2023/5/6 , @author icestone
// 引入v-md-editor编辑组件
app.use(VueMarkdownEditor)
app.use(store)
app.use(ElementPlus)

app.use(icepro)
// icepro.install(app)
console.log('app安装之后:')

console.log(app._context.components.ElButton)
console.log(app._context.components.iceCard)

// element icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.component('IndexHeader', IndexHeader)
app.use(router).mount('#app')
