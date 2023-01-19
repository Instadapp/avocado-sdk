<script setup lang="ts">
import { onMounted, onUnmounted, ref } from '@vue/runtime-dom';
import { bridge } from '../bridge';
import Transaction from './Transaction.vue';
const transactionData = ref(null)

const onTransaction = (data: any) => {
    transactionData.value = data
}

bridge.onRequest("sendTransaction", onTransaction)

const confirmTransaction = (data: any) => {
    bridge.response("sendTransaction", data)

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
    <Transaction v-if="transactionData" :data="transactionData" @confirm="confirmTransaction" />
</template>


<style lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>