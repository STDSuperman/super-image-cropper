# 🖼️ Super Image Cropper

<div align="center">

一个强大的JavaScript图像裁剪库，支持GIF动画、PNG、JPG等多种格式的图像裁剪。

[![npm version](https://img.shields.io/npm/v/super-image-cropper)](https://www.npmjs.com/package/super-image-cropper) [![npm downloads](https://img.shields.io/npm/dw/super-image-cropper)](https://www.npmjs.com/package/super-image-cropper) [![GitHub license](https://img.shields.io/github/license/STDSuperman/super-image-cropper)](https://github.com/STDSuperman/super-image-cropper/blob/master/LICENSE) [![GitHub stars](https://img.shields.io/github/stars/STDSuperman/super-image-cropper)](https://github.com/STDSuperman/super-image-cropper/stargazers) [![GitHub issues](https://img.shields.io/github/issues/STDSuperman/super-image-cropper)](https://github.com/STDSuperman/super-image-cropper/issues) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[🌟 在线演示](https://gif-cropper-stdsuperman.vercel.app/) | [📖 文档](#文档) | [🚀 快速开始](#快速开始) | [🇺🇸 English](../README.md)

</div>

## ✨ 特性

- 🎬 **GIF动画支持** - 裁剪GIF动画的同时保持动画效果
- 🖼️ **多格式支持** - 支持PNG、JPG、JPEG和GIF格式
- 🔧 **CropperJS集成** - 与流行的CropperJS库无缝集成
- 🎨 **灵活输出** - 多种输出格式：Base64、Blob或Blob URL
- ⚡ **高性能** - 针对大图像和动画进行了优化
- 🎯 **精确控制** - 对裁剪参数进行细粒度控制
- 📱 **跨平台** - 在所有现代浏览器中工作
- 🔄 **变换支持** - 支持旋转和缩放变换

## 🎯 在线体验

- **[在线演示](https://gif-cropper-stdsuperman.vercel.app/)** - 在浏览器中试用
- **[CodeSandbox](https://codesandbox.io/p/github/STDSuperman/codesandbox-super-image-cropper/master?workspaceId=6d860bca-a1bd-4c35-9131-07f0c5450764)** - 与CropperJS的交互式示例

### 预览

#### GIF动画裁剪
<img src="https://blog-images-1257398419.cos.ap-nanjing.myqcloud.com/github/gif-transparent.png" width="657" alt="GIF裁剪预览">

#### 静态图像裁剪
<img src="https://s4.ax1x.com/2022/02/23/bPUoIf.png" width="657" alt="静态图像裁剪预览">

## 🚀 快速开始

### 安装

```bash
npm install super-image-cropper
```

```bash
yarn add super-image-cropper
```

```bash
pnpm add super-image-cropper
```

### 基础用法

#### 与CropperJS配合使用（推荐）

```html
<img id="image" src="your-image.gif" alt="要裁剪的图像">
```

```typescript
import { SuperImageCropper } from 'super-image-cropper';
import Cropper from 'cropperjs';

// 初始化CropperJS
const image = document.getElementById('image') as HTMLImageElement;
const cropperInstance = new Cropper(image, {
  aspectRatio: 16 / 9,
  autoCrop: false,
  autoCropArea: 1,
  minCropBoxHeight: 10,
  minCropBoxWidth: 10,
  viewMode: 1,
  initialAspectRatio: 1,
  responsive: false,
  guides: true
});

// 创建裁剪器实例
const imageCropper = new SuperImageCropper();

// 裁剪图像
imageCropper.crop({
  cropperInstance: cropperInstance,
  src: 'your-image.gif',
  outputType: 'blobURL' // 可选，默认为blobURL
}).then(blobUrl => {
  const img = document.createElement('img');
  img.src = blobUrl;
  document.body.appendChild(img);
});
```

#### 独立使用

```typescript
import { SuperImageCropper } from 'super-image-cropper';

const imageCropper = new SuperImageCropper();

imageCropper.crop({
  src: 'your-image.gif',
  cropperJsOpts: {
    width: 400,
    height: 240,
    rotate: 45,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1
  },
  outputType: 'base64'
}).then(result => {
  console.log('裁剪后的图像:', result);
});
```

## 📖 API参考

### SuperImageCropper

#### 方法

##### `crop(options: CropOptions): Promise<string | Blob>`

根据提供的选项裁剪图像。

#### CropOptions

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `src` | `string` | 是 | 图像URL或路径 |
| `crossOrigin` | `string` | 否 | 图像加载的CORS策略 |
| `cropperInstance` | `Cropper` | 否 | CropperJS实例（与CropperJS一起使用时） |
| `cropperJsOpts` | `CropperJsOptions` | 否 | 手动裁剪参数 |
| `gifJsOptions` | `object` | 否 | [gif.js](https://github.com/jnordberg/gif.js) 配置 |
| `outputType` | `'base64' \| 'blob' \| 'blobURL'` | 否 | 输出格式（默认：`'blobURL'`） |

#### CropperJsOptions

| 属性 | 类型 | 描述 |
|------|------|------|
| `x` | `number` | 裁剪区域的左偏移 |
| `y` | `number` | 裁剪区域的顶偏移 |
| `width` | `number` | 裁剪区域的宽度 |
| `height` | `number` | 裁剪区域的高度 |
| `rotate` | `number` | 旋转角度（度） |
| `scaleX` | `number` | 水平缩放因子 |
| `scaleY` | `number` | 垂直缩放因子 |
| `background` | `string` | GIF背景色（可选） |

### 输出类型

- **`base64`** - 返回base64编码字符串
- **`blob`** - 返回Blob对象
- **`blobURL`** - 返回blob URL（例如：`blob:http://localhost:3000/8a583ca5...`）

## 🔧 示例

### React集成

查看我们的[React示例](../example/crop-gif-with-cropper)，了解与React和CropperJS的完整实现。

### 高级用法

```typescript
import { SuperImageCropper } from 'super-image-cropper';

const cropper = new SuperImageCropper();

// 使用自定义GIF选项进行裁剪
await cropper.crop({
  src: 'animated.gif',
  cropperJsOpts: {
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    rotate: 90,
    background: '#ffffff'
  },
  gifJsOptions: {
    quality: 10,
    workers: 2,
    workerScript: 'gif.worker.js'
  },
  outputType: 'blob'
});
```

## 🤝 贡献指南

我们欢迎贡献！请查看我们的[贡献指南](../CONTRIBUTING.md)了解详情。

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/STDSuperman/super-image-cropper.git

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

### 项目结构

```
super-image-cropper/
├── packages/
│   ├── super-image-cropper/    # 主库
│   └── gif-worker-js/          # GIF处理worker
├── example/                    # 示例应用
├── docs/                       # 文档
└── scripts/                    # 构建和发布脚本
```

## 📄 许可证

本项目采用MIT许可证 - 查看[LICENSE](../LICENSE)文件了解详情。

## 🙏 致谢

- [CropperJS](https://github.com/fengyuanchen/cropperjs) - 优秀的图像裁剪库
- [gif.js](https://github.com/jnordberg/gif.js) - GIF编码库
- 所有我们的[贡献者](https://github.com/STDSuperman/super-image-cropper/graphs/contributors)

## 📞 支持

- 🐛 [报告问题](https://github.com/STDSuperman/super-image-cropper/issues)
- 💬 [讨论](https://github.com/STDSuperman/super-image-cropper/discussions)
- ⭐ 如果这个项目对你有帮助，请给它一个星标！

---

<div align="center">

由 [STDSuperman](https://github.com/STDSuperman) 用 ❤️ 制作

</div>
