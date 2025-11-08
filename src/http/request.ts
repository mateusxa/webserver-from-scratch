import { PROTOCOL_VERSION } from "./constant.ts"

export default class Request {
    method: string
    route: string
    headers: Record<string, string>
    body?: any

    constructor(method: string, route: string, headers: Record<string, string>, body?: any) {
        this.method = method
        this.route = route
        this.headers = headers
    }

    static parse(request: string): Request {
        const data: string[] = request.trim().split('\r\n')

        const setupLine = data[0]?.split(' ')
        if (!setupLine) {
            throw new Error(`HTTP Request Malformed: ${setupLine}`)
        }
        const [method, rawRoute, protocol] = setupLine
        if (!method || !rawRoute || !protocol) {
            throw new Error(`HTTP Request Malformed: ${setupLine}`)
        }
        
        let route
        let queryString

        if (rawRoute.includes('?')) {
            [route, queryString] = rawRoute.split('?')
        } else {
            route = rawRoute
        }
        if(!route) {
            throw new Error(`Invalid route: ${rawRoute}`)
        }

        if (protocol !== PROTOCOL_VERSION) {
            throw new Error(`Invalid protocol: ${protocol}`)
        }

        let body;
        const headers: Record<string, string> = {}

        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] === "") {
                body = data.slice(i + 1)
                break;
            }
            const header = data[i]?.split(": ")
            if (!header) continue

            const [key, value] = header
            if (!key || !value) {
                console.log(`Error parsing header`)
                continue
            }
            headers[key] = value
        }
        return new Request(method, route, headers, body)
    }
}