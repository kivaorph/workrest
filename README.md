# 多语言网站项目

这是一个使用原生HTML、Tailwind CSS和FontAwesome构建的多语言网站项目。

## 项目结构

```
├── index.html          # 网站首页
├── assets/            # 静态资源目录
│   ├── images/       # 图片资源
│   └── fonts/        # 字体文件
├── css/              # 自定义样式文件
│   └── custom.css    # 自定义CSS样式
└── js/               # JavaScript文件
    └── main.js       # 主要JavaScript逻辑
```

## 技术栈

- HTML5
- Tailwind CSS (通过CDN引入)
- FontAwesome (通过CDN引入)
- 原生JavaScript

## 功能特点

- 响应式设计
- 中英文语言切换
- 现代化UI界面
- 优化的资源加载

## 使用说明

1. 直接在浏览器中打开 `index.html` 文件即可查看网站
2. 点击语言切换按钮可以在中文和英文之间切换
3. 所有样式都通过Tailwind CSS类名实现
4. 图标使用FontAwesome提供

## 开发说明

- 所有自定义样式请添加到 `css/custom.css` 文件中
- JavaScript逻辑请添加到 `js/main.js` 文件中
- 静态资源请放置在 `assets` 目录下对应的子目录中 