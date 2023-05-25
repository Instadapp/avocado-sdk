import { ethers } from "ethers"
import { createSafe } from "./src"

const provider = new ethers.providers.Web3Provider(window.ethereum, "any")

await provider.send("eth_requestAccounts", []);

const safe = createSafe(provider.getSigner())

document.querySelector('#app')!.innerHTML = `<button> Send Tx </button>`

document.querySelector("#app button")!.addEventListener('click', async () => {
    let safeAddress = await safe.getSafeAddress();

    console.log(
        await safe.sendTransaction({
            from: safeAddress,
            to: safeAddress,
            chainId: 137
        })
    )
})