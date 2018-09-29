import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
} from 'react-native';
import display from 'number-display';

import WebChart from './WebChart';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#111c4e',
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginLeft: 10,
  },
  tip: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
    marginLeft: 10,
  },
  chart: {
    height: 300,
    marginTop: 10,
    marginBottom: 40,
  },
});

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
    };
  }
  componentDidMount() {
    this.getData();
  }
  getData = () => setTimeout(() => this.setState({
    data: [{
      name: '一月',
      value: 8726.2453,
    }, {
      name: '二月',
      value: 2445.2453,
    }, {
      name: '三月',
      value: 6636.2400,
    }, {
      name: '四月',
      value: 4774.2453,
    }, {
      name: '五月',
      value: 1066.2453,
    }, {
      name: '六月',
      value: 4576.9932,
    }, {
      name: '七月',
      value: 8926.9823,
    }],
  }), 1000)
  alertMessage = (message) => {
    console.log(message);
    if (message.type === 'select') {
      const item = this.state.data[message.payload.index];
      Alert.alert(
        item.name,
        display(item.value),  // 转换数值为字符串并格式化
      );
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>使用示例</Text>
        <Text style={styles.tip}>- 1秒后加载数据</Text>
        <Text style={styles.tip}>- 点击柱形执行onMessage()</Text>
        <WebChart
          style={styles.chart}
          option={{
            dataset: {
              dimensions: ['name', 'value'],
              source: this.state.data || [{ name: null, value: 0 }],
            },
            color: ['#3398DB'],
            legend: {
              data: ['直接访问', '背景'],
              show: false,
            },
            grid: {
              left: '0%',
              right: '0%',
              bottom: '5%',
              top: '7%',
              height: '85%',
              containLabel: true,
              z: 22,
            },
            xAxis: [{
              type: 'category',
              gridIndex: 0,
              axisTick: {
                show: false,
              },
              axisLine: {
                lineStyle: {
                  color: '#0c3b71',
                },
              },
              axisLabel: {
                show: true,
                color: 'rgb(170,170,170)',
              },
            }],
            yAxis: {
              type: 'value',
              gridIndex: 0,
              splitLine: {
                show: false,
              },
              axisTick: {
                  show: false,
              },
              axisLine: {
                lineStyle: {
                  color: '#0c3b71',
                },
              },
              axisLabel: {
                color: 'rgb(170,170,170)',
                formatter: '{value}',
              },
              splitNumber: 12,
              splitArea: {
                show: true,
                areaStyle: {
                  color: ['rgba(250,250,250,0.0)', 'rgba(250,250,250,0.05)'],
                },
              },
            },
            series: [{
              name: '合格率',
              type: 'bar',
              barWidth: '50%',
              xAxisIndex: 0,
              yAxisIndex: 0,
              itemStyle: {
                normal: {
                  barBorderRadius: 5,
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0, color: '#00feff',
                      },
                      {
                        offset: 1, color: '#027eff',
                      },
                      {
                        offset: 1, color: '#0286ff',
                      },
                    ],
                  },
                },
              },
              zlevel: 11,
            }],
          }}
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
          onMessage={this.alertMessage}
        />
      </View>
    );
  }
}
