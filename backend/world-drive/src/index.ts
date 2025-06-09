import dotenv from 'dotenv'

const dotenvFile = dotenv.config({path: '../../local.env'})
if (dotenvFile.error) {
    console.error("Error loading .env file:", dotenvFile.error)
} else {
    console.info("Successfully loaded local.env file")
}

import coordinateService, {Subscriber} from './service/coordinateService'
import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import {Coordinate} from "./types/Coordinate"
import wttrInService from "./service/wttrInService"
import coordinateValidator from "./service/coordinateValidator"
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import path from 'path'

const app = express()
const port = 3001

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "World Drive API",
            version: "1.0.0",
        },
    },
    apis: [path.join(__dirname, '**/index.*')],
})

const server = http.createServer(app)
const wss = new WebSocket.Server({noServer: true})

/**
 * @swagger
 * /coordinates/current (WebSocket):
 *   get:
 *     summary: Subscribe to real-time coordinate updates via WebSocket
 *     description: >-
 *       Connect to this endpoint using a WebSocket client to receive real-time updates of the current coordinate.
 *       The server will send messages in the format: { coordinate: { lat: number, lng: number } }
 *     tags:
 *       - WebSocket
 *     responses:
 *       101:
 *         description: Switching Protocols (WebSocket upgrade)
 */
class WebSocketNotifier implements Subscriber {
    private ws: WebSocket

    constructor(ws: WebSocket) {
        this.ws = ws
    }

    notify(coordinate: Coordinate): void {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({coordinate}))
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

    ws.send(JSON.stringify({coordinate: coordinateService['currentCoordinate']}))

    ws.on('close', () => {
        coordinateService.unsubscribe(notifier)
    })
})

/**
 * @swagger
 * /coordinates/trail:
 *   get:
 *     summary: Get earlier coordinates
 *     description: Get the earlier coordinates of the PSE car
 *     tags:
 *       - HTTP
 *     responses:
 *       200:
 *         description: Earlier coordinates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coordinate'
 *
 * components:
 *   schemas:
 *     Coordinate:
 *       type: object
 *       properties:
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 */
app.get('/coordinates/trail', (req, res) => {
    const earlierCoordinates = coordinateService.getEarlierPositions()
    res.json(earlierCoordinates)
})

/**
 * @swagger
 * /weather:
 *   get:
 *     summary: Get weather data
 *     description: Get weather data for a specific coordinate or the current position
 *     tags:
 *       - HTTP
 *     parameters:
 *       - name: position
 *         in: query
 *         description: 'Specify "current" to get the current position, or provide lat and lng for a specific coordinate'
 *         required: false
 *         schema:
 *           type: string
 *       - name: lat
 *         in: query
 *         description: Latitude of the coordinate
 *         required: false
 *         schema:
 *           type: number
 *       - name: lng
 *         in: query
 *         description: Longitude of the coordinate
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Weather data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeatherData'
 *       400:
 *         description: Invalid coordinates
 *       500:
 *         description: Error while fetching weather data
 *
 * components:
 *   schemas:
 *     WeatherData:
 *       type: object
 *       properties:
 *         degreesCelsius:
 *           type: number
 *         weatherDescription:
 *           type: string
 *         cityName:
 *           type: string
 */
app.get('/weather', async (req, res) => {
    let coordinate: Coordinate

    if (req.query.position === 'current') {
        coordinate = coordinateService.getCurrentPosition()
    } else {
        coordinate = {latitude: parseFloat(req.query.lat as string), longitude: parseFloat(req.query.lng as string)}

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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the service is healthy
 *     tags:
 *       - HTTP
 *     responses:
 *       200:
 *         description: Service is healthy
 */
app.get('/health', (req, res) => {
    res.status(200).json({name: 'pse-cars-backend-world-drive', status: 'healthy'})
})

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: API documentation (this endpoint)
 *     description: Access the API documentation Swagger UI.
 *     tags:
 *       - HTTP
 */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
    console.log(`Coordinates WebSocket endpoint available at ws://localhost:${port}/coordinates/current`)
})
// TODO: HATEOAS
