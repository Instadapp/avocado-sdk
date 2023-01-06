import type { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
export declare type SendReturnResult = {
    result: any;
};
export declare type SendReturn = any;
export declare type Send = (method: string, params?: any[]) => Promise<SendReturnResult | SendReturn>;
export declare type SendOld = ({ method }: {
    method: string;
}) => Promise<SendReturnResult | SendReturn>;
export declare class NoEthereumProviderError extends Error {
    constructor();
}
export declare class UserRejectedRequestError extends Error {
    constructor();
}
export declare class AvocadoInjectedConnector extends AbstractConnector {
    #private;
    constructor(kwargs: AbstractConnectorArguments & {
        chainId: number;
    });
    private handleChainChanged;
    private handleAccountsChanged;
    private handleClose;
    private handleNetworkChanged;
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<any>;
    getChainId(): Promise<number | string>;
    getAccount(): Promise<null | string>;
    deactivate(): void;
    isAuthorized(): Promise<boolean>;
}
