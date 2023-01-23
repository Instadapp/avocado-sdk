import { defineCustomElement } from '@vue/runtime-dom'
//@ts-ignore
import App from './ui/App.ce.vue'

const AvocadoSafeElement = defineCustomElement(App)

export function register() {
    if(! customElements.get('avocado-safe-element')){
        customElements.define('avocado-safe-element', AvocadoSafeElement)
    }

    if(! document.querySelector('avocado-safe-element')){
        document.body.appendChild(new AvocadoSafeElement())
    }
}

export function unregister() {
    document.querySelectorAll('avocado-safe-element').forEach((element) => {
        element.remove()
    })
}