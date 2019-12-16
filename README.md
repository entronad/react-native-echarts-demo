**Are you want to read this in English? [switch to English version](README(English).md)**

# 更新

**2019-12-11**

- 采用canvas渲染器。对于目前的移动设备，canvas效果好于svg。
- 目前在加载本地html方面，react-native-webview比原本的WebView组件问题还多：
  [react-native-community/react-native-webview#746](https://github.com/react-native-community/react-native-webview/issues/746)
  建议不要升到那么高，还用原本的WebView

**2019-11-05**

- 优化函数序列化与反序列化的代码，将首次加载 option 移出 script ，也通过 webView.postMessage 的方式加载，以避免处理函数序列化中出现的转义字符。



# 介绍

> 一种在 React Native 中封装的响应式 Echarts 组件，使用与示例请参见：[react-native-echarts-demo](https://github.com/entronad/react-native-echarts-demo)

近年来，随着移动端对数据可视化的要求越来越高，类似 [MPAndroidChart](https://github.com/PhilJay/MPAndroidChart) 这样的传统图表库已经不能满足产品经理日益变态的需求。前端领域数据可视化的发展相对繁荣一些，通过 WebView 在移动端使用 [Echarts](http://echarts.baidu.com/) 这样功能强大的前端数据可视化库，是解决问题的好办法。

React Native 开发中，由于使用的是与前端相同的 JavaScript 语言，衔接 Echarts 的工作相对顺畅些，不过一些必要的组件封装还是能够大大提高开发效率的。

Echarts 官方推荐过一个第三方封装库：[react-native-echarts](https://github.com/somonus/react-native-echarts)（注：它对应的 nmp package 名字为 [native-echarts](https://www.npmjs.com/package/native-echarts)  ），目前有 400+ stars 和 100+ 的周下载量，可见还是被广泛使用的。但是我们经过调研，发现 react-native-echarts 存在以下一些问题：

- 该库已半年多未更新，Echarts 版本停留在 3.0 ，Android 端打包需手动添加 assets 的问题也一直未处理
- 库的接口灵活度较低，比如只能通过 width、height 设置大小；无法使用 Echarts 扩展包；无法进行事件注册、WebView 通信等

由于用 WebView 封装 Echarts 涉及到本地 html，不是纯 JavaScript 语言层面的功能，又没有 native 代码，所以做成 nmp package 并不是一个很好的选择，写成项目里的内部组件，自己进行配置反而是更方便更灵活的方案。

因此我们决定不使用第三方的 Echarts 封装库，自己写一个通用组件 WebChart 。为方便开发中使用，该组件具有以下特点：

- 按照响应式进行设计，只需在 option 中配置好数据源，数据变化后图表就会自动刷新，更符合 React 的风格。

  我们的方案是在组件每次 update 时判断传入的 option 参数是否发生变化，如果变化通过 webView.postMessage ，以 JSON 的形式传入新的 option ，通知 Echarts 重新 setOption 。

  虽然 Echarts 本身会对 option 进行对比，但事先判断可以减少 update 导致的与 WebView 频繁通信，这一点在容器父组件中有大量异步请求时还是很明显的；在 WebView 内部，更新则是采用 Echarts 本身的 setOption 而无需 reload 整个 WebView

- 利用 WebView 的 postMessage 和 onMessage 接口，可实现图表与其它 React Native 组件的事件通信

- 通过组件的 exScript 参数，可为 WebView 添加任意脚本，使用灵活

- 由于是自己写的组件， echarts 版本、扩展包，svg/canvas 、数据增量加载都可以自己设定

# Demo 与使用方法

使用与示例请参见：[react-native-echarts-demo](https://github.com/entronad/react-native-echarts-demo)，如果你需要直接使用，可按以下步骤移植：

1. 将根目录下的 WebChart 组件文件夹拷到你项目中合适的地方
2. 将 /android/app/src/main/assets/web 文件夹拷到你项目同样位置，没有 assets 文件夹需手动创建。

只需以上两步就可以在项目中使用 WebChart 组件了。

如果需要进一步定制的话，Echarts 代码在以上两个文件夹中的 index.html 里 \<script /\> 标签内，目前是放的是 4.0 完整版，无扩展包，可到[官网](http://echarts.baidu.com/download.html)下载所需的版本和扩展包替换；svg/canvas 、数据增量加载等可在 WebChart/index.js 中直接进行修改。在移动端，出于性能的考虑，我们一般使用 svg 的渲染模式。

WebChart 具体使用可参见 App.js ，style 的设置就和普通的 React Native 组件一样，可使用 flex ，也可设为定值。额外的三个参数：

- option(object)：赋给 setOption 的参数对象，发生变化后 WebChart 内部会自动调用 setOption ，实现响应式刷新。特别注意，JSON 解析时未进行函数的处理，所以需避免使用函数式的 formatter 和类形式的 LinearGradient ，和 demo 一样使用模板式和普通对象的吧
- exScript(string)：任何你想在 WebView  加载时执行的代码，一般会是事件注册之类的，推荐使用模板字面量
- onMessage(function)：WebView 内部触发 postMessage 之后的回调，postMessage 需先在 exScript 中进行设置，用于图表与其它 React Native 组件的通信

当然这是根据我们的业务需要设计的参数，你完全可以自由重新设定。

# Echarts与React Native组件的通信

在 React Native 的 WebView 组件中，提供了 onMessage 和 postMessage 来进行 html 与组件的双向通信，具体使用可参加文档。

利用 webView.postMessage ，WebChart 实现了通知 Echarts 执行 setOption ；在 exScript 中，可利用 window.postMessage 实现 Echarts 的事件向 React Native 组件的通信。

一般我们会约定通信的 data 为这样格式的对象：

```
{
  type: 'someType',
  payload: {
  	value: 111,
  },
}
```

由于 onMessage 和 postMessage 只能进行字符串的传递，在 exScript 需进行 JSON 序列化，类似这样：

```
exScript={`
  chart.on('click', (params) => {
    if(params.componentType === 'series') {
      window.postMessage(JSON.stringify({
        type: 'select',
        payload: {
      	  index: params.dataIndex,
        },
      }));
    }
  });
`}
```



以上就是我们封装的响应式 WebChart 组件及使用，完整代码请参见：[react-native-echarts-demo](https://github.com/entronad/react-native-echarts-demo)。

在使用中，还有以下几个坑未解决，目前只能绕过，欢迎知道的同学指正：

- 在 IOS 中，Echarts 好像渲染不出透明的效果，用 rgba 设置的颜色不能正常
- React Native 的 WebView 好像 style.height 属性无效，因此不得不在外面套了个 View
- 按现在的资源加载方式，index.html 在 Android 上会有两份。因为平台判断是运行时进行的，哪怕分开设置 index.anroid.js 和 index.ios.js 打包时也会都打包进去，而 Android 中又必须手动添加 assets
- index.html 中必须内联引入 Echarts 的代码，外部引用单独的 js 文件好像无效
