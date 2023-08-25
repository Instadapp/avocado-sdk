import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { AVOCADO_CHAIN_ID, AVOCADO_RPC } from './config'

export const RPC_URLS: { [chainId: number]: string } = {
    1: 'https://eth.drpc.org',
    137: 'https://polygon-rpc.com',
    43114: 'https://api.avax.network/ext/bc/C/rpc',
    250: 'https://rpc.ftm.tools',
    10: 'https://mainnet.optimism.io',
    42161: 'https://arb1.arbitrum.io/rpc',
    [AVOCADO_CHAIN_ID]: AVOCADO_RPC,
    100: 'https://rpc.gnosischain.com',
    56: 'https://bsc-dataseed.binance.org',
    1101 : 'https://zkevm-rpc.com',
    1313161554: "https://mainnet.aurora.dev",
    8453: "https://developer-access-mainnet.base.org",
}

const rpcInstances: Record<string, StaticJsonRpcProvider> = {}

export const getRpcProvider = (chainId: number | string) => {
    if (!rpcInstances[chainId]) {
        rpcInstances[chainId] = new StaticJsonRpcProvider(RPC_URLS[Number(chainId)])
    }

    return rpcInstances[chainId]
}

export const setRpcUrls = (rpcUrls: { [chainId: number]: string }) => {
    Object.assign(RPC_URLS, rpcUrls)
    
    RPC_URLS[AVOCADO_CHAIN_ID] = AVOCADO_RPC
}