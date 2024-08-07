// 主题独有配置
import { getThemeConfig } from '@sugarat/theme/node'

// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  // 开启RSS支持
  // RSS,

  // 搜索
  // 默认开启pagefind离线的全文搜索支持（如使用其它的可以设置为false）
  // search: false,

  // markdown 图表支持（会增加一定的构建耗时）
  // mermaid: true

  // 页脚
  footer: {
    // message 字段支持配置为HTML内容，配置多条可以配置为数组
    // message: '下面 的内容和图标都是可以修改的噢（当然本条内容也是可以隐藏的）',
    copyright: 'MIT License | momo blog',
    icpRecord: {
      name: '津ICP备19011083号-2',
      link: 'https://beian.miit.gov.cn/'
    },
    // securityRecord: {
    //   name: '公网安备xxxxx',
    //   link: 'https://www.beian.gov.cn/portal/index.do'
    // },
  },

  // 主题色修改
  themeColor: 'el-blue',

  // 文章默认作者
  author: 'InkInk',

  // 友链
  friend: [
    {
      nickname: '粥里有勺糖',
      des: '你的指尖用于改变世界的力量',
      avatar:
        'https://img.cdn.sugarat.top/mdImg/MTY3NDk5NTE2NzAzMA==674995167030',
      url: 'https://sugarat.top',
    },
    {
      nickname: 'Vitepress',
      des: 'Vite & Vue Powered Static Site Generator',
      avatar:
        'https://vitepress.dev/vitepress-logo-large.webp',
      url: 'https://vitepress.dev/',
    },
  ],

})

export { blogTheme }
