import { PROTOCOL_VERSION } from "./constant.js";

export default class Response {

    private setupLine(statusCode: number, statusText: string) {
        return `${PROTOCOL_VERSION} ${statusCode} ${statusText}`
    }

    methodNotAllowed() {
        return `${this.setupLine(405, 'METHOD NOT ALLOWED')}\r\n\r\n`
    }

    notFound() {
        return `${this.setupLine(404, 'NOT FOUND')}\r\n\r\n`
    }

    internalServerError() {
        return `${this.setupLine(500, 'INTERNAL SERVER ERROR')}\r\n\r\n`
    }

    success(payload?: Buffer, mimeType: string = 'application/octet-stream'): Buffer {
        const response: string[] = [this.setupLine(200, 'OK')]
        if (!payload) {
            return Buffer.from(`${response[0]}\r\n\r\n`)
        }
        
        response.push(`Content-Type: ${mimeType}`)
        response.push(`Content-Length: ${payload.byteLength}`)
        response.push('')

        const headers = Buffer.from(response.join('\r\n'))

        const newLine = Buffer.from('\r\n')

        return Buffer.concat([headers, newLine, payload, newLine, newLine])
    }
}