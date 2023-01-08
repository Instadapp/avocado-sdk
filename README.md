# avocado-safe

## Usage
Install package:

```sh
# npm
npm install avocado-safe

# yarn
yarn add avocado-safe

# pnpm
pnpm install avocado-safe
```

Import:

```js
// ESM
import {} from "avocado-safe";

// CommonJS
const {} = require("avocado-safe");
```


## Examples

```ts
import { AvocadoSafeProvider } from 'avocado-safe'
import { ethers } from 'ethers'
import Web3 from 'web3'

const ethereum = new AvocadoSafeProvider({ chainId: 137 }) // window.etherem
await ethereum.enable()

const provider = new ethers.providers.Web3Provider(ethereum)
const web3 = new Web3(ethereum)

console.log(await provider.listAccounts())
console.log(await provider.getBalance("0x910E413DBF3F6276Fe8213fF656726bDc142E08E"))
console.log(await web3.eth.getBalance("0x910E413DBF3F6276Fe8213fF656726bDc142E08E"))
```


```ts
import { AvocadoInjectedConnector } from 'avocado-safe'

const avocado = new AvocadoInjectedConnector({ chainId: 137 })

const { activate } = useWeb3() // web3-react v6 or @instadapp/vue-web3
await activate(avocado)
```