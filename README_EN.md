# Note

For now, when developing cross-platform mobile apps, we think Flutter is better than React Native. To use Echarts widgets in Flutter, please see: https://github.com/entronad/flutter_echarts 

# Update

**2019-12-11**

- Use canvas renderer. For current mobile devices, canvas works better than svg.
- Currently, react-native-webview has more problems than the original WebView component in loading local html:
  [react-native-community/react-native-webview#746](https://github.com/react-native-community/react-native-webview/issues/746)
  It is recommended not to rise so high, and use the original WebView

**2019-11-05**

- Optimize the function serialization and deserialization code, remove the first load option from script, and also load it through webView.postMessage to avoid processing escape characters that appear in function serialization.



# Introduction

> A reactive Echarts component encapsulated in React Native. For usage and examples, see: [react-native-echarts-demo](https://github.com/entronad/react-native-echarts-demo)

In recent years, with the increasing demand for data visualization on mobile terminals, traditional chart libraries such as [MPAndroidChart](https://github.com/PhilJay/MPAndroidChart) have been unable to meet the increasingly perverted needs of product managers. The development of data visualization in the front-end field is relatively prosperous. Using a powerful front-end data visualization library such as [Echarts](http://echarts.baidu.com/) on the mobile terminal through WebView is a good way to solve the problem.

In the development of React Native, because the same JavaScript language as the front end is used, the connection to Echarts is relatively smooth, but some necessary component packaging can still greatly improve the development efficiency.

Echarts has officially recommended a third-party package library: [react-native-echarts](https://github.com/somonus/react-native-echarts) (Note: its corresponding nmp package name is [native-echarts](https://www.npmjs.com/package/native-echarts)), there are currently 400+ stars and 100+ weekly downloads, which shows that it is still widely used. But after research, we found that react-native-echarts has the following problems:

- The library has not been updated for more than half a year, the Echarts version stays at 3.0, and the issue of manually adding assets to the Android package has not been addressed.
- The interface of the library is less flexible, for example, the size can only be set by width and height; Echarts extension package cannot be used; event registration, WebView communication, etc.

Because wrapping Echarts with WebView involves local html, it is not a pure JavaScript language level function, and there is no native code, so it is not a good choice to make nmp package. It is more convenient to write the internal components in the project and configure it yourself. More flexible solutions.

So we decided not to use a third-party Echarts wrapper library and write a general component WebChart ourselves. In order to facilitate the use in development, this component has the following characteristics:

- Design according to the responsiveness, just configure the data source in the option, and the chart will refresh automatically after the data changes, which is more in line with React's style.

  Our solution is to determine whether the option parameter passed in changes every time the component updates. If the change passes webView.postMessage, a new option is passed in JSON, and Echarts is notified to reset the option.

  Although Echarts itself compares options, judging in advance can reduce the frequent communication with WebView caused by update. This is still obvious when there are a large number of asynchronous requests in the container parent component. In WebView, the update uses Echarts itself. setOption without reloading the entire WebView

- Use WebView's postMessage and onMessage interfaces to implement event communication between charts and other React Native components

- Add any script to the WebView through the component's exScript parameter, which is flexible

- Because it is a self-written component, echarts version, extension package, svg / canvas, and incremental data loading can be set by yourself

# Demo and usage

For usage and examples, please see: [react-native-echarts-demo](https://github.com/entronad/react-native-echarts-demo), if you need to use it directly, you can transplant it according to the following steps:

1. Copy the WebChart component folder in the root directory to the appropriate place in your project
2. Copy the /android/app/src/main/assets/web folder to the same location as your project. No assets folder needs to be created manually.

In just two steps, you can use the WebChart component in your project.

If further customization is needed, the Echarts code is in the index.html \<script/\> tags in the above two folders. At present, it is the 4.0 full version without extension packs. You can go to the [Official Website](http://echarts.baidu.com/download.html) Download the required version and extension package replacement; svg / canvas, incremental data loading, etc. can be directly modified in WebChart/index.js. On mobile, for performance reasons, we generally use svg's rendering mode.

The specific use of WebChart can be found in App.js. The style settings are the same as ordinary React Native components. You can use flex or set the value. Three additional parameters:

- option (object): The parameter object assigned to setOption. After the change occurs, WebChart will automatically call setOption to implement responsive refresh. Pay special attention to the fact that no function processing is performed during JSON parsing, so you should avoid using functional formatters and class-like LinearGradient. Use template and ordinary objects like demo.
- exScript (string): Any code you want to execute when the WebView is loaded, it will usually be event registration and the like, it is recommended to use template literals
- onMessage (function): WebView internally triggers a callback after postMessage. postMessage needs to be set in exScript for communication between the chart and other React Native components.

Of course, this is a parameter designed according to our business needs, and you can completely reset it.

# Echarts communication with React Native components

In the WebView component of React Native, onMessage and postMessage are provided for two-way communication between html and the component, and the specific use can participate in the document.

Using webView.postMessage, WebChart implements notifications to Echarts to execute setOption; in exScript, window.postMessage can be used to communicate Echarts' events to React Native components.

Generally, we will agree that the data to be communicated is an object of this format:

```
{
  type: 'someType',
  payload: {
    value: 111,
  },
}
```

Because onMessage and postMessage can only pass strings, JSON serialization is required in exScript, similar to this:

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



The above is the responsive WebChart component we have packaged and its use. For the complete code, please see: [react-native-echarts-demo](https://github.com/entronad/react-native-echarts-demo).

In use, the following pits are still unresolved, and can only be bypassed at present, and students who know are welcome to correct me:

- In IOS, Echarts does not seem to render transparent effects, and the colors set with rgba are not normal
- React Native's WebView seems to have an invalid style.height property, so I have to put a View outside
- According to the current resource loading method, there will be two copies of index.html on Android. Because the platform judges it at runtime, even if you set index.anroid.js and index.ios.js separately, they will be packaged in the package, and assets must be manually added in Android.
- Echarts code must be introduced inline in index.html, external reference to separate js files seems invalid
