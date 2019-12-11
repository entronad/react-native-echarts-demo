/* eslint-disable */
import React from 'react';
import {
  View,
  WebView,
  Platform,
} from 'react-native';

import html from './index.html';

const os = Platform.OS;

// Handle functions in option
const stringify = obj => JSON.stringify(obj, (key, val) => {
  if (typeof val === 'function') {
    return val.toString();
  }
  return val;
});

/**
 * props:
 * 
 * option(Object):        Param of chart.setOption(), 
 *                        the setOption will auto execute when option is changed.
 * exScript(String):      Any JavaScript that will execute when WebView is loaded.
 * oMessage(Function):    The handler for the WebView's postMessage.
 *                        You will have to set postMessage in the exScript first.
 */
export default class WebChart extends React.Component {
  static defaultProps = {
    option: {},
    exScript: '',
    onMessage: () => {},
  }
  componentDidUpdate(prevProps, prevState) {
    this.update(prevProps.option);
  }
  update = (prevOption) => {
    const optionJson = stringify(this.props.option);
    const prevOptionJson = stringify(prevOption);
    if (optionJson !== prevOptionJson) {
      this.webView.postMessage(optionJson);
    }
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
          originWhitelist={['*']}
          injectedJavaScript={`
            const parse = str => JSON.parse(str, (key, val) => {
              if (val.indexOf && val.indexOf('function') > -1) {
                return eval('(' + val + ')')
              }
              return val
            });
            const chart = echarts.init(document.getElementById('main'), null);
            document.addEventListener('message', (e) => {
              chart.setOption(parse(e.data), true);
            });
            ${this.props.exScript}
          `}
          // Remove setOption in script, instead update once when loaded.
          onLoadEnd={() => { this.update(null); }}
          onMessage={(e) => { this.props.onMessage(JSON.parse(e.nativeEvent.data)); }}
        />
      </View>
    );
  }
}
