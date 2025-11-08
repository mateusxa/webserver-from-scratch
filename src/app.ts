import HttpServer from './http/server.ts';

const PORT = 3000

const server = new HttpServer().createServer()

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})