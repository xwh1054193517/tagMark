<script setup lang="ts">
import { ref } from 'vue';
import tagMark from '../packages/tagMark'
import imgUrl from './assets/123123.png'
</script>

<template>
<tagMark :img-url="imgUrl"></tagMark>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
