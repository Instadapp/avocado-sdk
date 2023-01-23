<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from '@vue/runtime-dom';
import { bridge } from '../bridge';
import { AvocadoSafeProvider } from '../AvocadoSafeProvider';

const loaded = ref(false)
const open = ref(false)
const provider = shallowRef<AvocadoSafeProvider>()
const safeAddress = ref()
const accountAddress = ref()

const onSafeProvider = async (event: any) => {
    loaded.value = true
    provider.value = event;
    safeAddress.value = await provider.value!.safe.getSafeAddress()
    accountAddress.value = await provider.value!.safe.getOwnerddress()
}

onMounted(() => {
    bridge.bus.on("AvocadoSafeProvider", onSafeProvider)
})

onUnmounted(() => {
    bridge.bus.off("AvocadoSafeProvider", onSafeProvider)
})
</script>

<template>
    <div v-if="loaded" class="fixed z-[9999999] bottom-0 right-0 p-5">

        <div v-show="open" class="bg-gray-950 mb-5 rounded-7.5 p-7.5 w-full md:w-[400px] text-white">
            {{ safeAddress }}
        </div>

        <button @click="open = !open"
            class="bg-blue-500 w-11 h-11 flex items-center justify-center rounded-full ml-auto">
            <svg class="w-4 h-4 transform transition-all" :class="{ 'rotate-180': open }" viewBox="0 0 16 16"
                fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4L14 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 10L8 4" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    </div>
</template>