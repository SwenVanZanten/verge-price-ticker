declare module 'socks5-node-fetch' {
    import {RequestInfo, RequestInit, Response} from 'node-fetch'

    interface Options {
        socksHost: string
        socksPort: string|number
    }

    function fetch (
        url: RequestInfo,
        init?: RequestInit
    ): Promise<Response>;

    export default function wrappedFetch (options: Options): typeof fetch;
}
