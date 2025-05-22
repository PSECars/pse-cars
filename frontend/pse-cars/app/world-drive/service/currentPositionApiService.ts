export type Coordinate = {
    latitude: number
    longitude: number
}

type CoordinateCallback = (coordinate: Coordinate) => void

class CurrentPositionApiService {
    private static instance: CurrentPositionApiService

    private ws: WebSocket | null = null
    private subscribers: Set<CoordinateCallback> = new Set()

    private constructor() {}

    /**
     * Get our singleton instance
     */
    static getInstance(): CurrentPositionApiService {
        if (!CurrentPositionApiService.instance) {
            CurrentPositionApiService.instance = new CurrentPositionApiService();
        }
        return CurrentPositionApiService.instance;
    }

    public connect() {
        if (this.ws) {
            return
        }

        this.ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_WORLD_DRIVE_HOST}/coordinates/current`)

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.coordinate) {
                this.subscribers.forEach(cb => cb(data.coordinate))
            }
        }

        this.ws.onclose = () => {
            this.ws = null
        }
    }

    public subscribe(cb: CoordinateCallback) {
        this.subscribers.add(cb)
        this.connect()
    }

    public unsubscribe(cb: CoordinateCallback) {
        this.subscribers.delete(cb)
        if (this.subscribers.size === 0 && this.ws) {
            this.ws.close()
            this.ws = null
        }
    }
}

export default CurrentPositionApiService.getInstance()