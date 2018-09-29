/* eslint-disable */
import React from 'react';
import {
  View,
  WebView,
  Platform,
} from 'react-native';

import html from './index.html';

const os = Platform.OS;

/**
 * props:
 * 
 * option(Object): Param of chart.setOption(), 
 *                 the setOption will auto execute when option is changed.
 * exScript(String): Any JavaScript that will execute when WebView is loaded.
 * oMessage(Function): The handler for the WebView's postMessage.
 *                     You will have to set postMessage in the exScript first.
 */
export default class WebChart extends React.Component {
  static defaultProps = {
    option: {},
    exScript: '',
    onMessage: () => {},
  }
  componentDidUpdate(prevProps, prevState) {
    // 处理option中函数类型的属性
    const callback = (key, val) => {
      if (typeof val === 'function') {
        return val.toString();
      }
      return val;
    }
    const optionJson = JSON.stringify(this.props.option, callback);
    if (optionJson !== JSON.stringify(prevProps.option)) {
      this.update(optionJson);
    }
  }
  update = (optionJson) => {
    this.webView.postMessage(optionJson);
  }
  render() {
    return (
      <View style={this.props.style}>
        <WebView
          ref={(elem) => { this.webView = elem; }}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          scrollEnabled={false}
          scalesPageToFit={os !== 'ios'}
          source={os === 'ios' ? html : { uri: 'file:///android_asset/web/WebChart/index.html' }}
          injectedJavaScript={`
            const chart = echarts.init(document.getElementById('main'), null, { renderer: 'svg' });
            chart.setOption(${JSON.stringify(this.props.option)});
            document.addEventListener('message', (e) => {
              chart.setOption(JSON.parse(e.data, function(key, val) {
                if (val.indexOf && val.indexOf('function') > -1) {
                  return eval('(' + val + ')')
                }
                return val
              }), true);
            });
            ${this.props.exScript}
          `}
          onMessage={(e) => { this.props.onMessage(JSON.parse(e.nativeEvent.data)); }}
        />
      </View>
    );
  }
}
