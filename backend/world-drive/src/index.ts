import coordinateService, { Subscriber } from './service/coordinateService'
import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import {Coordinate} from "./types/Coordinate"
import wttrInService from "./service/wttrInService"
import coordinateValidator from "./service/coordinateValidator";

const app = express()
const port = 3000

const server = http.createServer(app)
const wss = new WebSocket.Server({ noServer: true })

class WebSocketNotifier implements Subscriber {
    private ws: WebSocket

    constructor(ws: WebSocket) {
        this.ws = ws
    }

    notify(coordinate: Coordinate): void {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ coordinate }))
        }
    }
}

server.on('upgrade', (request, socket, head) => {
    if (request.url === '/coordinates/current') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request)
        })
    } else {
        socket.destroy()
    }
})

wss.on('connection', (ws: WebSocket) => {
    const notifier = new WebSocketNotifier(ws)
    coordinateService.subscribe(notifier)

    ws.send(JSON.stringify({ coordinate: coordinateService['currentCoordinate'] }))

    ws.on('close', () => {
        coordinateService.unsubscribe(notifier)
    })
})

app.get('/coordinates/trail', (req, res) => {
    const earlierCoordinates = coordinateService.getEarlierPositions()
    res.json(earlierCoordinates)
})

app.get('/weather', async (req, res) => {
    let coordinate: Coordinate

    if (req.query.position === 'current') {
        coordinate = coordinateService.getCurrentPosition()
    } else {
        coordinate = { latitude: parseFloat(req.query.lat as string), longitude: parseFloat(req.query.lng as string) }

        if (!coordinateValidator.isValidCoordinate(coordinate)) {
            res.status(400).send('Invalid coordinate')
        }
    }

    try {
        const weatherData = await wttrInService.getWeatherAt(coordinate)
        res.json(weatherData)
    } catch (error) {
        console.error('Error while fetching weather data:', error)
        res.status(500).send('Error while fetching weather data')
    }
})

app.get('/health', (req, res) => {
    res.status(200).send('healthy')
})

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
    console.log(`Coordinates WebSocket endpoint available at ws://localhost:${port}/coordinates/current`)
})
// TODO: HATEOAS
