<template>
  <div class="header">
    <slot></slot>
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 1rem;
  /* padding-bottom: 10px; */
  font-size: 0.4rem;
  font-weight: bold;
  color: #fff;
  background: url('@/assets/images/header_bg.png');
  background-repeat: no-repeat;
  background-size: 100% 1rem;
}
</style>
