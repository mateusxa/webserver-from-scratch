import { existsSync, readFileSync } from 'node:fs';
import { createServer, Socket } from 'node:net';
import path, { extname } from 'node:path';
import { mimeTypes } from './http/mimeType.ts';
import Request from './http/request.ts';
import Response from './http/response.ts'

const __dirname = import.meta.dirname
const TIMEOUT = 60000
const PORT = 3000

const server = createServer(
    (socket) => {
        socket.setTimeout(TIMEOUT)

        const response = new Response()
        socket.on('data', (data) => {
            try {
                console.log(`data: ${data}`)
                const request = Request.parse(data.toString())

                if (request.method !== 'GET') {
                    socket.write(response.methodNotAllowed())
                } else {
                    console.log(`route: ${request.route}`)
                    
                    let fileName
                    if (!extname(request.route)) {
                        fileName = `${request.route}/index.html`
                    } else {
                        fileName = request.route
                    }
                    const filePath = path.join(__dirname, 'pages', fileName)
                    
                    if (!existsSync(filePath)) {
                        socket.write(response.notFound())
                    } else {
                        //////////////
                        // NOTE: Add a safeguard to prevent directory traversal (e.g., "../") 
                        // so users can't access files outside the allowed directory or system folders.
                        const payload = readFileSync(filePath)
                        const mimeType = mimeTypes[extname(filePath)];
                        if (!mimeType) {
                            throw new Error(`Invalid MimeType`)
                        }
                        //////////////
                        
                        socket.write(response.success(payload, mimeType))
                    }
                }
            } catch (error) {
                console.log(`Internal Server Error: ${error}`)
                socket.write(response.internalServerError())
            }
        })

        socket.on('timeout', () => {
            socket.write(response.timeout())
            socket.end()
        })
    }
)

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})