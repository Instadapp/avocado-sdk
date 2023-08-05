# @instadapp/avocado

## Usage
Install package:

```sh
# npm
npm install @instadapp/avocado

# yarn
yarn add @instadapp/avocado

# pnpm
pnpm install @instadapp/avocado
```

Import:

```js
// ESM
import {} from "@instadapp/avocado";

// CommonJS
const {} = require("@instadapp/avocado");
```


## Examples

```ts
import { createSafe } from '@instadapp/avocado'
import { ethers } from 'ethers'

// Should be connected to chainId 634 (https://rpc.avocado.instadapp.io), before doing any transaction
const provider = new ethers.providers.Web3Provider(window.ethereum, "any")

const safe = createSafe( provider.getSigner() )

await safe.getOwnerAddress()

await safe.getSafeAddress()

await safe.sendTransaction({
    to: "0x910E413DBF3F6276Fe8213fF656726bDc142E08E",
    value: 42,
    chainId: 137
})

await safe.sendTransaction({
    to: "0x910E413DBF3F6276Fe8213fF656726bDc142E08E",
    value: 42,
}, 137)

await safe.sendTransactions([
    { to: "0x910E413DBF3F6276Fe8213fF656726bDc142E08E", value: 42 }
    { to: "0x910E413DBF3F6276Fe8213fF656726bDc142E08E", value: 69 }
], 137)

await safe.estimateFee([
    { to: "0x910E413DBF3F6276Fe8213fF656726bDc142E08E", value: 0 }
], 137)

await safe.getSigner().sendTransaction({
    to: "0x69420",
    chainId: 137
})

const signer = safe.getSignerForChainId(137);

await signer.sendTransaction({
    to: "0x69420"
})

const erc20 = new ethers.Contract(
    "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    ["function transfer(address to, uint amount) returns (bool)",],
    signer,
)

await erc20.transfer("0x910E413DBF3F6276Fe8213fF656726bDc142E08E", 69420)
```

```ts
import { Wallet, ethers } from "ethers"

const wallet = new Wallet(
    "PK_HERE", 
    new ethers.providers.JsonRpcProvider("https://rpc.avocado.instadapp.io")
)

const safe = createSafe(wallet)

await safe.sendTransaction({
    to: "0x910E413DBF3F6276Fe8213fF656726bDc142E08E",
    value: 0,
    chainId: 137
})
```
