<script setup lang="ts">
import { onMounted, onUnmounted, ref } from '@vue/runtime-dom';
import { AvocadoSafeProvider } from '../AvocadoSafeProvider';
import { bridge } from '../bridge';
import Transaction from './Transaction.vue';
const props = defineProps<{ provider: AvocadoSafeProvider }>()
// import Widget from './Widget.vue';

const transactionData = ref(null)

const onTransaction = (data: any) => {
    transactionData.value = data
}

bridge.onRequest("sendTransaction", onTransaction)

const confirmTransaction = (data: any) => {
    bridge.response("sendTransaction", data)

    transactionData.value = null
}

const cancelTransaction = () => {
    bridge.response("sendTransaction", null)

    transactionData.value = null
}

onMounted(() => {
    bridge.onRequest("sendTransaction", onTransaction)
})

onUnmounted(() => {
    bridge.offRequest("sendTransaction", onTransaction)
})
</script>

<template>
    <div class="font-sans">
        <Transaction v-if="transactionData" :data="transactionData" @confirm="confirmTransaction"
            @cancel="cancelTransaction" :provider="provider"/>

        <!-- <Widget /> -->
    </div>
</template>


<style lang="postcss">
@import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

.loading-box {
  background: linear-gradient(-45deg, #475569, #334155, #334155);
  background-size: 400% 400%;
  animation: gradient 1.6s linear infinite;
}

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style>