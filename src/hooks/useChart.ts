import { type Ref, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { throttle } from 'lodash-es';
import { useResize } from './useResize';
import type { EChartsOption, ECharts } from 'echarts';

export function useChart(
  elRef: Ref,
  theme?:string
) {
  let chartsInstenceRef: ECharts | null = null;
  let resizeFn = resize;
  const debounceResize = throttle(resizeFn, 200);
  resizeFn = debounceResize;

  function init() {
    chartsInstenceRef = echarts.init(elRef.value, theme);
  }
  const setOptions = (options: EChartsOption) => {
    init();
    nextTick(() => {
      chartsInstenceRef?.setOption(options);
    });
  };

  function resize() {
    if (!chartsInstenceRef) {
      return;
    }
    chartsInstenceRef?.resize();
  }
  useResize(resizeFn);
  onUnmounted(() => {
    if (!chartsInstenceRef) {
      return;
    }
    chartsInstenceRef.dispose();
    chartsInstenceRef = null;
  });
  return {
    setOptions,
    echarts,
  };
}
