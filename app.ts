import { readFileSync } from 'node:fs';
import { createServer, Socket } from 'node:net';
import path, { extname } from 'node:path';
import { mimeTypes } from './http/mimeType.ts';
import Request from './http/request.ts';
import Response from './http/response.ts';

const PORT = 3000

const server = createServer(
    (socket) => {
        const response = new Response()
        socket.on('data', (data) => {
            try {
                const request = Request.parse(data.toString())

                if (request.method !== 'GET') {
                    socket.end(response.methodNotAllowed())
                }
                
                //////////////
                // NOTE: Add a safeguard to prevent directory traversal (e.g., "../") 
                // so users can't access files outside the allowed directory or system folders.
                const payload = readFileSync(`./pages${request.route}`)
                const mimeType = mimeTypes[extname(`./pages${request.route}`)];
                if (!mimeType) {
                    throw new Error(`Invalid MimeType`)
                }
                //////////////
                
                socket.end(response.success(payload, mimeType))
            } catch (error) {
                socket.end(response.internalServerError())
            }
        })
    }
)

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})