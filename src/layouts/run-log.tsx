import { Typography, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Input } from "antd";
import axios from "axios";
// import { Chart } from "@antv/g2";
import * as echarts from "echarts";
import React, { useState, useEffect, useRef } from "react";

type EChartsOption = echarts.EChartsOption;
const { Search } = Input;
const { Text } = Typography;

export type RunLogType = {
  key: number;
  time: string;
  line: number;
  message: string;
  detail: { line: number; message: string };
};

interface ChartProps {
  dataSource: RunLogType[];
}

// const G2Chart: React.FC<G2ChartProps> = (props) => {
//   const { dataSource } = props;

//   const container = useRef<HTMLDivElement | null>(null);
//   const chart = useRef<Chart | null>(null);

//   useEffect(() => {
//     if (!chart.current) {
//       chart.current = renderChart(container.current!, dataSource);
//     }
//   }, []);

//   useEffect(() => {
//     updateChart(chart.current, dataSource);
//   }, [dataSource]);

//   function renderChart(container:HTMLElement, data:RunLogType[]) {
//     const newData = data.map((value)=>{
//       return {"time": value.time.slice(0, -4), value:1}
//     })

//     const chart = new Chart({
//       container,
//       theme: 'classic',
//       height: 1000,
//       autoFit: true,
//       inset: 10,
//     });

//     // 声明可视化
//     chart
//       .point()
//       .data(newData)
//       .encode("x", (d:any) => new Date(d.time).getUTCDate())
//       .encode("y", "value")
//       .scale('y', {
//         type: 'point'
//       })
//       .scale('x', {
//           type: 'time',
//           mask: 'YYYY-MM-dd hh:mm:ss',
//           tickCount: 10,
//           range: [0, 0.98],
//         }
//       );

//     // 渲染可视化
//     chart.render();

//     return chart;
//   }

//   function updateChart(chart: Chart |null, data: RunLogType[]) {
//     const newData = data.map((value)=>{
//       return {"time": value.time.slice(0, -4), value:1}
//     })
//     console.log('newData', newData)

//     if (chart) {
//       chart
//         .point()
//         .data(newData)
//         .encode("x", (d:any) => new Date(d.time).getUTCDate())
//         .encode("y", "value")
//         .scale('y', {
//           type: 'point'
//         })
//         .scale('x', {
//             type: 'time',
//             mask: 'YYYY-MM-dd hh:mm:ss',
//             tickCount: 10,
//           }
//         );

//       // 重新渲染
//       chart.render();
//     }
//   }

//   return (
//     <div>
//         <div ref={container}></div>
//     </div>
//   );
// }

const MyEChart: React.FC<ChartProps> = (props) => {
  const { dataSource } = props;

  const container = useRef<HTMLDivElement | null>(null);
  const chart = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    initChart();
  }, []);

  useEffect(() => {
    updateChart(dataSource);
  }, [dataSource]);

  const initChart = () => {
    const option: EChartsOption = {
      dataset: {
        source: [],
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
        },
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          // inverse: true,
          axisLine: { onZero: false },
          splitLine: { show: false },
          min: "dataMin",
          max: "dataMax",
        },
        {
          type: "category",
          gridIndex: 0,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          min: "dataMin",
          max: "dataMax",
        },
      ],
      yAxis: [
        {
          scale: true,
          splitArea: {
            show: true,
          },
        },
        {
          scale: true,
          gridIndex: 0,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      grid: [
        {
          left: "10%",
          right: "10%",
          bottom: 80,
        },
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1],
          start: 0,
          end: 100,
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: "slider",
          bottom: 10,
          start: 10,
          end: 90,
        },
      ],
      series: [
        {
          name: "报错",
          type: "scatter",
          symbolSize: 5,
          itemStyle: {
            color: "#ec0000",
            borderColor: "#8A0000",
          },
          encode: {
            x: 0,
            y: [1, 4, 3, 2],
          },
        },
      ],
    };

    const myChart = echarts.init(container.current!);
    myChart.setOption(option);
    chart.current = myChart;
  };

  const updateChart = (data: RunLogType[]) => {
    const newDataX = data.map((value) => {
      const t: string[] = value.time.slice(0, -4).split(" ");
      const s = t[0] + "\n" + t[1];
      return [s];
    });
    const newDataY = data.map((_, value) => {
      return value;
    });
    console.log("updateChart", newDataX, newDataY);

    chart.current!.setOption({
      xAxis: {
        data: newDataX
      },
      series: [
        {
          name: "报错",
          data: newDataY,
        },
      ],
    });
  };
  return (
    <div>
      <div
        ref={container}
        style={{
          width: "100%",
          height: "300px",
        }}
      ></div>
    </div>
  );
};
const RunLog: React.FC = () => {
  const [searching, setSearching] = useState<boolean>(false);
  const [data, setData] = useState<RunLogType[]>([]);

  let cache: RunLogType[] = [];

  const columns: ColumnsType<RunLogType> = [
    {
      dataIndex: "line",
      title: <Text strong>行号</Text>,
      width: 80,
    },
    {
      dataIndex: "time",
      title: <Text strong>时间</Text>,
      //sorter: (a, b) => a.time - b.time,
      width: 200,
    },
    {
      dataIndex: "message",
      title: <Text strong>内容</Text>,
      ellipsis: { showTitle: true },
    },
    // {
    //   dataIndex: "detail",
    //   title: <Text strong>详情</Text>,
    //   width: 100,
    // },
  ];

  async function search(value: string) {
    axios
      .get("/api/search", {
        params: {
          q: value,
        },
      })
      .then(function (response) {
        console.log(response);
        setSearching(false);

        const interval = setInterval(() => {
          // console.log('get result')
          axios.get("/api/get").then((response) => {
            // console.log('response', response)
            if (response.data == "None") {
              clearInterval(interval);
            } else {
              const ds: RunLogType[] = (response.data as RunLogType[]).map(
                (value, index) => {
                  return {
                    key: index,
                    line: value.line,
                    time: value.time,
                    message: value.message,
                    detail: value.detail,
                  };
                }
              );
              // console.log('before', cache, ds)
              cache = [...cache, ...ds];
              setData(cache);
              // console.log('after', cache)
            }
          });
        }, 2000);

        // // 建立websocket http://127.0.0.1:5000
        // const websocket = new WebSocket('ws://127.0.0.1:5000/test');
        // console.log('websocket', websocket)
        // websocket.onopen = () => {
        //   console.log('WebSocket init success!');
        // };
        // websocket.onmessage = (evt) => {
        //   console.log('WebSocket Recv Msg:', evt.data);
        // };
        // websocket.onerror = (evt) => {
        //   console.log('WebSocket error!', evt);
        // };
        // websocket.onclose = () => {
        //   console.log('WebSocket close!');
        // };
        // setWs(websocket)
      })
      .catch(function (error) {
        console.log(error);
        setSearching(false);
      });
  }

  return (
    <>
      {/* <G2Chart dataSource={data} /> */}
      <MyEChart dataSource={data} />
      <Search
        placeholder="输入关键字搜索，用空格分隔"
        defaultValue="ERROR"
        enterButton="搜索"
        size="large"
        loading={searching}
        onSearch={(value) => {
          if (searching) {
            // 处于搜索状态，停止搜索
            // ws?.close()
            setSearching(false);
          } else {
            // 处于未搜索状态，开始搜索
            setSearching(true);
            search(value);
          }
        }}
      />

      <Table<RunLogType>
        columns={columns}
        dataSource={data}
        rowKey="runlog"
        pagination={false}
      />
    </>
  );
};

export default RunLog;
