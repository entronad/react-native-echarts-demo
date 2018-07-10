import React from 'react';
import {
  View,
  WebView,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

import html from './index.html';

const os = Platform.OS;

export default class WebChart extends React.Component {
  static propTypes = {
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
      PropTypes.number,
    ]),

    option: PropTypes.object.isRequired,
    exScript: PropTypes.string,
    onMessage: PropTypes.func,
  }
  componentDidUpdate(prevProps, prevState) {
    const optionJson = JSON.stringify(this.props.option);
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
              chart.setOption(JSON.parse(e.data), true);
            });
            ${this.props.exScript ? this.props.exScript : ''}
          `}
          onMessage={(e) => { this.props.onMessage(JSON.parse(e.nativeEvent.data)); }}
        />
      </View>
    );
  }
}
