import {  AvocadoSafeProvider } from "./lib"

const provider = new AvocadoSafeProvider({ chainId : 137 })

provider.enable().then(console.log)

//@ts-ignore
window.provider = provider