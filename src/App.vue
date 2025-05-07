<script setup>
import cbl from './components/cbl.vue'
import { RouterView } from 'vue-router'
import { ref, watch } from "vue";
import { useRoute } from 'vue-router'
const route = useRoute()
let isLoginOrRegister = ref(false)
watch(() => route.path, (newPath) => {
  isLoginOrRegister.value = newPath === '/login' || newPath === '/register'
}, { immediate: true })



</script>

<template>
  <div class="app_box">
    <div class="left" v-if="!isLoginOrRegister">
      <cbl />
    </div>
    <div class="right">
      <RouterView />
    </div>
  </div>
</template>

<style scoped >
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app_box {
  display: flex;
  height: 100vh;
}
.left {
  flex: 1;
}
.right {
  flex: 18;
}

body {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

a {
  text-decoration: none;
  color: #4080ff;
}
</style>
