<script setup lang="ts">
import { BigNumber } from "@ethersproject/bignumber";
import type { AvocadoSafeProvider } from "../AvocadoSafeProvider";
import NetworkSVG from "./icons/Network.vue";
import GasSVG from "./icons/Gas.vue";
import UsdcSVG from "./icons/USDC.vue";
import ExclamationSVG from "./icons/Exclamation.vue";
import AvocadoSVG from "./icons/Avocado.vue";
import { onMounted, ref, toRaw, computed } from "vue";
import ChainLogo from "./ChainLogo.vue";

type CalculateFeeProps = {
  fee: string;
  multiplier: string;
  chainId: string;
};

type FeeProps = {
  min: number;
  max: number;
  formatted: string;
};

const props = defineProps<{ data: any; provider: AvocadoSafeProvider }>();
const fee = ref<FeeProps>({ min: 0, max: 0, formatted: "" });
const usdcBalance = ref(0);
const loading = ref(false);

const emit = defineEmits(["confirm", "cancel", "topup"]);

function formatUsd(value: any, fractionDigits = 2) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(value);
}

const calculateEstimatedFee = (params: CalculateFeeProps): FeeProps => {
  const minFee = {
    "137": 0.01,
    "10": 0.005,
    "42161": 0.005,
    "43114": 0.005,
    "1": 0.005,
    "100": 0.01,
    "56": 0.01,
  };

  const { fee, multiplier = "0" } = params;
  if (!fee)
    return {
      min: 0,
      max: 0,
      formatted: "",
    };

  const maxVal = BigNumber.from(fee).div("1000000000000000000").toNumber();

  const minVal = BigNumber.from(fee)
    .div(multiplier)
    .div("100000000000000")
    .toNumber();

  const minChainFee = minFee[String(params.chainId) as keyof typeof minFee];

  const actualMin = Math.max(minVal, minChainFee);
  const actualMax = Math.max(maxVal, minChainFee);

  return {
    min: actualMin,
    max: actualMax,
    formatted: `${formatUsd(actualMin)} - ${formatUsd(actualMax)}`,
  };
};

const isBalaceNotEnough = computed(() => {
  if (loading.value) return false;
  const { max } = fee.value;
  const balance = Number(usdcBalance.value);

  return balance < max;
});

onMounted(async () => {
  try {
    loading.value = true;

    const balanceHex = await props.provider.request({
      method: "eth_getBalance",
      params: [props.data.signer],
    });

    usdcBalance.value = BigNumber.from(balanceHex)
      .div(BigNumber.from(10).pow(18))
      .toNumber();

    console.log(
      BigNumber.from(balanceHex).div(BigNumber.from(10).pow(18)).toNumber()
    );

    const estimatedFee = await props.provider.avoNetworkProvider.send(
      "txn_estimateFeeWithoutSignature",
      [props.data.message, props.data.signer, String(props.data.chainId)]
    );

    fee.value = calculateEstimatedFee({
      fee: estimatedFee.fee,
      multiplier: estimatedFee.multiplier,
      chainId: props.data.chainId,
    });
  } catch(e) {
    console.log(e)
  } finally {
    loading.value = false;
  }
});

const chainIdToName = (chainId: string | number) => {
  switch (String(chainId)) {
    case "1":
      return "Mainnet";
    case "137":
      return "Polygon";
    case "10":
      return "Optimism";
    case "42161":
      return "Arbitrum";
    case "43114":
      return "Avalanche";
    case "100":
      return "Gnosis";
    case "56":
      return "BSC";
    case "250":
      return "Fantom";
    case "634":
      return "Avocado";
    default:
      throw new Error(`Unknown chainId ${chainId}`);
  }
};

const confirm = () => {
  emit("confirm", {
    // u can override gasLimit, source, validUntil, metadata
  });
};

const topup = () => {
  emit("topup");
};

const cancel = () => {
  emit("cancel");
};
</script>
<template>
  <div
    class="relative z-[9999999] dark:text-white text-slate-900"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      @click="cancel"
    ></div>
    <div class="fixed inset-0 z-[9999999] overflow-y-auto">
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity"
        @click="cancel"
      ></div>
      <div
        class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
      >
        <div
          class="relative transform overflow-hidden rounded-[10px] p-7.5 bg-white dark:bg-gray-950 text-left shadow-xl transition-all sm:w-full sm:max-w-[460px] sm:pt-[35px] sm:pb-10 sm:px-10"
        >
          <div class="flex flex-col gap-7.5">
            <div class="flex justify-between items-center">
              <div class="text-lg font-semibold leading-[30px]">
                Send Transaction
              </div>
              <div
                class="py-2 px-2.5 dark:bg-gray-850 border dark:border-slate-750 bg-slate-50 border-slate-200 rounded-[10px]"
              >
                <AvocadoSVG />
              </div>
            </div>

            <div class="flex flex-col gap-2.5">
              <div
                class="dark:bg-gray-850 bg-slate-50 flex flex-col gap-4 rounded-[10px] py-[14px] px-5"
              >
                <div class="flex justify-between items-center">
                  <div class="text-slate-400 flex items-center gap-2.5">
                    <NetworkSVG />
                    <span class="text-xs leading-5 font-medium">Network</span>
                  </div>

                  <div class="flex items-center gap-2.5">
                    <span class="text-xs font-medium">
                      {{ chainIdToName(data.chainId) }}
                    </span>
                    <ChainLogo
                      class="w-[18px] h-[18px]"
                      :chain="data.chainId"
                    />
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <div class="text-slate-400 flex items-center gap-2.5">
                    <GasSVG />
                    <span class="text-xs leading-5 font-medium"
                      >Estimated gas fees</span
                    >
                  </div>

                  <div class="flex items-center gap-2.5">
                    <span
                      v-if="loading"
                      class="w-20 h-5 loading-box rounded-lg"
                    ></span>
                    <span v-else class="text-xs">{{ fee.formatted }}</span>
                    <UsdcSVG />
                  </div>
                </div>
              </div>
              <div
                v-if="isBalaceNotEnough"
                class="flex items-center justify-between font-semibold text-xs rounded-[10px] bg-red-alert bg-opacity-10 py-2.5 px-3"
              >
                <p class="flex items-center gap-2.5 text-red-alert">
                  <ExclamationSVG />

                  Not enough USDC gas
                </p>

                <button
                  @click="topup"
                  class="h-[26px] px-3 bg-blue-500 rounded-md text-white"
                >
                  Top-up
                </button>
              </div>
            </div>
            <div class="flex justify-between items-center gap-4">
              <button
                type="button"
                @click="cancel"
                class="w-full text-center h-[44px] text-sm font-semibold leading-5 bg-slate-800 text-white py-3 px-4 rounded-[10px]"
              >
                Reject
              </button>

              <button
                :disabled="loading || isBalaceNotEnough"
                type="button"
                @click="confirm"
                class="w-full dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:text-slate-400 disabled:bg-slate-200 text-center h-[44px] text-sm font-semibold leading-5 hover:bg-blue-600 bg-blue-500 text-white py-3 px-4 rounded-[10px]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
