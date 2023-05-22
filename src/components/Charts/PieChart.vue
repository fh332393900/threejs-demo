<template>
  <div class="chart" ref="chartRef"></div>
</template>

<script setup lang="ts" name="PieCharts">
import { useChart } from '@/hooks/useChart';
import type { EChartsOption } from 'echarts';
import { ref, type Ref, onMounted } from 'vue';

const chartRef: Ref = ref(null);
const { setOptions } = useChart(chartRef);
let option: EChartsOption;

onMounted(() => {
  init();
});

const init = () => {
  option = {
    title: {
      text: 'Referer of a Website',
      left: 'center',
      textStyle: {
        color: '#fff',
        fontSize: '0.3rem',
      },
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        fontSize: '0.2rem',
      },
    },
    // legend: {
    //   orient: 'vertical',
    //   left: 'left',
    // },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: 'Search Engine' },
          { value: 735, name: 'Direct' },
          { value: 580, name: 'Email' },
          { value: 484, name: 'Union Ads' },
          { value: 300, name: 'Video Ads' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          // fontSize: '0.2rem',
          color: '#fff',
          fontWeight: 'bold',
        },
      },
    ],
    textStyle: {
    },
  };
  
  setOptions(option);
};


</script>

<style scope>
.chart {
  width: 100%;
  height: 40vh;
}
</style>
