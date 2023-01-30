import { defineCustomElement } from '@vue/runtime-dom'
import { AvocadoSafeProvider } from './AvocadoSafeProvider'
//@ts-ignore
import App from './ui/App.ce.vue'

const AvocadoSafeElement = defineCustomElement(App)

export function register(provider: AvocadoSafeProvider) {
    if(! customElements.get('avocado-safe-element')){
        customElements.define('avocado-safe-element', AvocadoSafeElement)
    }

    if(! document.querySelector('avocado-safe-element')){
        document.body.appendChild(new AvocadoSafeElement({
            provider
        }))
    }
}

export function unregister() {
    document.querySelectorAll('avocado-safe-element').forEach((element) => {
        element.remove()
    })
}