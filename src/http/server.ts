import net, { Socket } from 'node:net'
import path, { extname } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import Request from './request.ts'
import Response from './response.ts'
import { mimeTypes } from './mimeType.ts'

const __dirname = import.meta.dirname

export default class HttpServer {

    private readonly TIMEOUT: number
    private response: Response

    constructor(timeout = 60000) {
        this.TIMEOUT = timeout
        this.response = new Response()  
    }

    public createServer(): net.Server {
        return net.createServer((socket) => {
            socket.setTimeout(this.TIMEOUT)
            
            socket.on('timeout', () => this.timeout(socket))
            socket.on('data', (data) => this.data(data, socket))
        })
    }

    private timeout(socket: Socket): void {
        socket.end(this.response.timeout())
    }

    private data(data: Buffer, socket: Socket): void {
        try {
            const request = Request.parse(data.toString())
            
            const filePath = this.getFilepath(request.route, request.headers)
            if (!existsSync(filePath)) {
                socket.write(this.response.notFound())
                return
            }
            
            const { payload, mimeType } = this.loadFile(filePath)

            socket.write(this.response.success(payload, mimeType))
        } catch (error) {
            console.log(`Internal Server Error: ${error}`)
            socket.write(this.response.internalServerError())
            return
        }
    }

    private getFilepath(route: string, headers?: Record<string, string>): string {
        const root = path.join(__dirname, '../pages');
        
        let isHtml: boolean = true
        if (headers && 'content-type' in headers && headers['content-type'] !== 'text/html') {
            isHtml = false
        }

        let fileName = !extname(route) && isHtml ? `${route}/index.html` : route
        fileName = fileName.replace(/^\/+/, '')

        const resolved = path.resolve(root, fileName);
        if (!resolved.startsWith(root)) {
            console.log(`Inavlid Path: ${route}`)
            return ''
        }

        return resolved;
    }    

    private loadFile(filePath: string) {
        const payload = readFileSync(filePath)
        const mimeType = mimeTypes[extname(filePath)];
        if (!mimeType) {
            throw new Error(`Invalid MimeType`)
        }
        return { payload, mimeType }
    }
}
