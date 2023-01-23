import mitt from 'mitt'
import { AvocadoSafeProvider } from './AvocadoSafeProvider';

class Bridge {
    bus = mitt()

    setAvocadoSafeProvider(provider: AvocadoSafeProvider) {
        this.bus.emit("AvocadoSafeProvider", provider)
    }

    request(type: string, data: any) {
        return new Promise<any>((resolve) => {
            this.bus.emit("request:" + type, data);

            const handler = (data: any) => {
                resolve(data)

                this.bus.off("request:" + type, handler)

            }

            this.bus.on("response:" + type, handler)
        })
    }

    onRequest(type: string, cb: (event: any) => void) {
        this.bus.on(`request:${type}`, cb)
    }

    offRequest(type: string, cb: (event: any) => void) {
        this.bus.off(`request:${type}`, cb)
    }

    response(type: string, data: any) {
        this.bus.emit(`response:${type}`, data)
    }

}

export const bridge = new Bridge

