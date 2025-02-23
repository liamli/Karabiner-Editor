；mm'b'b# Karabiner Editor

一个用于配置和管理 Karabiner-Elements 键盘映射的图形化编辑器。

## 项目简介

本项目是一个基于 Electron + Vue 的桌面应用程序，旨在为 macOS 用户提供一个直观、易用的 Karabiner-Elements 规则配置编辑器。通过图形化界面，用户可以轻松地创建、编辑和管理键盘映射规则，无需手动编辑复杂的 JSON 配置文件。

## 功能特性

- 图形化界面，操作直观
- 支持键盘映射规则的可视化编辑
- 配置完后直接转换成 Karabiner 的规则
- 支持配置文件的导出
- 内置常用映射模板

## 系统要求

- macOS 10.15 或更高版本
- 已安装 Karabiner-Elements

## 安装说明

1. 从 Release 页面下载最新版本的安装包
2. 双击下载的 .dmg 文件
3. 将应用程序拖入 Applications 文件夹
4. 启动应用程序

## 开发环境设置

```bash
# 克隆项目
git clone [项目地址]

# 进入项目目录
cd Karabiner_Editor/electron-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建应用
npm run build
```

## 技术栈

- Electron
- Vue 3
- Element Plus
- TypeScript
- Vite

## 贡献指南

欢迎提交 Issue 和 Pull Request。在提交 PR 之前，请确保：

1. 代码符合项目的编码规范
2. 所有测试用例通过
3. 更新相关文档

## 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

## 联系方式

如有问题或建议，请通过 Issue 与我们联系。