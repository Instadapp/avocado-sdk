<script setup lang="ts">
import { onMounted, onUnmounted, ref } from '@vue/runtime-dom';
import { bridge } from '../bridge';
import Transaction from './Transaction.vue';
const transaction = ref(null)

const onTransaction = (rawTx: any) => {
    transaction.value = rawTx
}

bridge.onRequest("sendTransaction", onTransaction)

const confirmTransaction = (data: any) => {
    bridge.response("sendTransaction", data)

    transaction.value = null
}

onMounted(() => {
    bridge.onRequest("sendTransaction", onTransaction)
})

onUnmounted(() => {
    bridge.offRequest("sendTransaction", onTransaction)
})
</script>

<template>
    <Transaction v-if="transaction" :transaction="transaction" @confirm="confirmTransaction" />
</template>


<style lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>