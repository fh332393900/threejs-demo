<template>
  <div
    class="popover"
    :style="{
      'top': props.top + 'px',
      'left': props.left + 'px',
      'display': isShow ? 'inline-block' : 'none'
    }"
  >
    <div class="popover-title">
      {{ dataRef.name }}
    </div>
    <div class="popover-content">
      {{ 'content' }}
    </div>
  </div>
</template>

<script lang="ts" setup name="Popover">
import { ref } from 'vue';
type PropsTypes = {
  top: number;
  left: number;
};

const props = withDefaults(defineProps<PropsTypes>(), {
  top: 0,
  left: 0,
});

const isShow = ref(false);
const dataRef = ref<any>({});

const setShow = (visible: boolean, data?: any) => {
  isShow.value = visible;
  if (data) dataRef.value = data;
};

defineExpose({
  setShow,
});
</script>

<style scoped>
.popover {
  position: absolute;
  background-color: rgb(29 78 216 / 0.6);
  border-radius: 5px;
  font-size: 0.2rem;
  color: #fff;
}
.popover-title {
  padding: 12px;
  border-bottom: 1px solid #fff;
}
.popover-content {
  padding: 24px;
}
</style>
