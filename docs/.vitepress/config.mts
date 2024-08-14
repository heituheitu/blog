import {defineConfig} from 'vitepress'

// 导入主题的配置
import {blogTheme} from './blog-theme'
// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
    // 继承博客主题(@sugarat/theme)
    extends: blogTheme,
    ignoreDeadLinks: [
        // 忽略精确网址 "/playground"
        '/playground',
        // 忽略所有 localhost 链接
        /^https?:\/\/localhost/,
        // 忽略所有包含 "/repl/" 的链接
        /\/repl\//,
        // 自定义函数，忽略所有包含 "ignore "的链接
        (url) => {
            return url.toLowerCase().includes('ignore')
        }
    ],
    lang: 'zh-cn',
    title: 'InkInk',
    description: '欢迎来到我的博客',
    lastUpdated: true,
    // 详见：https://vitepress.dev/zh/reference/site-config#head
    head: [
        // 配置网站的图标（显示在浏览器的 tab 上）
        ['link', {rel: 'icon', href: '/favicon.ico'}]
    ],
    themeConfig: {
        // 展示 2,3 级标题在目录中
        outline: {
            level: [2, 3],
            label: '目录'
        },
        // 默认文案修改
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '相关文章',
        lastUpdatedText: '上次更新于',

        // 设置logo
        logo: '/logo.png',
        //https://shortvideo.hexun.com/icon/WechatIMG280.jpg
        nav: [
            {text: '首页', link: '/'},
            {text: '技术笔记', link: '/blog/technology/网关GateWay'},
            {text: '读书笔记', link: '/blog/notes/小米创业思考'},
            {text: '八股文', link: '/blog/interview/interviewList'},
            {text: '网络好文', link: '/blog/article/人际交往思考'}
        ],
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/heituheitu/heituheitu.github.io'
            }
        ]
    }
})
