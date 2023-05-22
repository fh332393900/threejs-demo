import { onMounted, onUnmounted } from 'vue';

/**
 * 窗口缩放
 * @param handlerFn 回调函数
 * @param immediate 立即调用
 */
export function useResize<T = any>(
  handlerFn: () => T,
  immediate: boolean = true
) {
  const handler = () => {
    handlerFn();
  };
  onMounted(() => {
    window.addEventListener('resize', handler);
    immediate && handler();
  });
  onUnmounted(() => {
    window.removeEventListener('resize', handler);
  });
}
