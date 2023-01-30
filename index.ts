import { AvocadoSafeProvider } from "./src"

const provider = new AvocadoSafeProvider({ chainId: 137 })

provider.enable().then(console.log)

//@ts-ignore
window.provider = provider

document.querySelector('#app')!.innerHTML = `<button> Send Tx </button>`


document.querySelector("#app button")!.addEventListener('click', async () => {
    let safeAddress = await provider.safe.getSafeAddress();

    provider.request({
        method: "eth_sendTransaction",
        params: [
            {
                from: safeAddress,
                to: safeAddress,
            }
        ]
    })
})

provider.request({
    method: "eth_getBalance",
    params: ["0x910E413DBF3F6276Fe8213fF656726bDc142E08E", "latest"]
}).then(console.log)