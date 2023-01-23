<script setup lang="ts">
import { onMounted, onUnmounted, ref } from '@vue/runtime-dom';
import { bridge } from '../bridge';
import Transaction from './Transaction.vue';
import Widget from './Widget.vue';

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
    console.log("cancelTransaction")
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
    <Transaction v-if="transactionData" :data="transactionData" @confirm="confirmTransaction" @cancel="cancelTransaction" />

    <Widget /> 
</template>


<style lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>