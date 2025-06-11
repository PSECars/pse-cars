import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { Coordinate } from '../types/Coordinate'

interface CoordinateWithTimestamp {
    latitude: number
    longitude: number
    timestamp?: number
}

/**
 * CoordinateDBService singleton class to handle coordinate db interactions.
 */
export class CoordinateDBService {
  private static instance: CoordinateDBService

  private readonly url = process.env.WORLD_DRIVE_INFLUXDB_URL ?? 'http://localhost:8086'
  private readonly token = process.env.WORLD_DRIVE_INFLUXDB_ADMIN_TOKEN!
  private readonly org = process.env.WORLD_DRIVE_INFLUXDB_ORG!
  private readonly bucket = process.env.WORLD_DRIVE_INFLUXDB_BUCKET!

  private readonly influxDB = new InfluxDB({ url: this.url, token: this.token })
  private readonly writeApi = this.influxDB.getWriteApi(this.org, this.bucket, 'ms')
  private readonly queryApi = this.influxDB.getQueryApi(this.org)

  /**
   * Get our singleton instance
   */
  public static getInstance(): CoordinateDBService {
    if (!CoordinateDBService.instance) {
      CoordinateDBService.instance = new CoordinateDBService();
    }
    return CoordinateDBService.instance;
  }

  /**
   * Save a coordinate to the InfluxDB.
   * @param coordinate the coordinate to save
   * @param timestamp the unix timestamp the coordinate was measured (created) at
   */
  async saveCoordinate(coordinate: Coordinate, timestamp: number): Promise<void> {
    const point = new Point('coordinate')
      .floatField('latitude', coordinate.latitude)
      .floatField('longitude', coordinate.longitude)
      .timestamp(new Date(timestamp))
    this.writeApi.writePoint(point)
    await this.writeApi.flush()
  }

  /**
   * Load the latest coordinate from the InfluxDB.
   * @returns The latest coordinate with timestamp, or null if none found
   */
  async loadLatestCoordinate(): Promise<{ latitude: number; longitude: number; timestamp: number } | null> {
    const fluxQuery = `from(bucket: "${this.bucket}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "coordinate") |> sort(columns: ["_time"], desc: true) |> limit(n:2)`
    const latest: { latitude: number; longitude: number; timestamp: number } = { latitude: NaN, longitude: NaN, timestamp: NaN }
    return new Promise((resolve, reject) => {
      this.queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row)
          if (o._field === 'latitude') latest.latitude = o._value
          if (o._field === 'longitude') latest.longitude = o._value
          if (isNaN(latest.timestamp)) latest.timestamp = new Date(o._time).getTime()
        },
        error(error) {
          reject(error)
        },
        complete() {
          if (!isNaN(latest.latitude) && !isNaN(latest.longitude) && !isNaN(latest.timestamp)) {
            resolve(latest)
          } else {
            resolve(null)
          }
        }
      })
    })
  }

    /**
     * Load all coordinates from the InfluxDB since a given timestamp.
     * Returns at most 300 coordinates, evenly distributed over the time range, as not to overload the client.
     * @param sinceTimestamp Unix timestamp (ms) to start from
     * @returns Array of Coordinate (latitude, longitude)
     */
    async loadCoordinatesSince(sinceTimestamp: number): Promise<Coordinate[]> {
        // Use the oldest coordinate timestamp if it's younger than the given timestamp
        const oldestTimestamp = await this.getOldestCoordinateTimestamp()
        const effectiveSince = Math.max(sinceTimestamp, oldestTimestamp || 0)

        const now = Date.now()
        const totalPoints = 300
        const intervalMs = Math.max(Math.floor((now - effectiveSince) / totalPoints), 1)
        const intervalStr = intervalMs < 1000 ? '1ms' : intervalMs < 60000 ? `${Math.floor(intervalMs / 1000)}s` : `${Math.floor(intervalMs / 60000)}m`

        const fluxQuery = `from(bucket: "${this.bucket}")
          |> range(start: -${now - effectiveSince}ms)
          |> filter(fn: (r) => r._measurement == "coordinate")
          |> aggregateWindow(every: ${intervalStr}, fn: last, createEmpty: false)`

        const coordinates: CoordinateWithTimestamp[] = []
        return new Promise((resolve, reject) => {
            this.queryApi.queryRows(fluxQuery, {
                next(row, tableMeta) {
                    const o = tableMeta.toObject(row)

                    // Find or create the coordinate for this timestamp
                    let coordinate = coordinates.find(c => c.timestamp === new Date(o._time).getTime())
                    if (!coordinate) {
                        coordinate = { latitude: NaN, longitude: NaN, timestamp: new Date(o._time).getTime() }
                        coordinates.push(coordinate)
                    }

                    if (o._field === 'latitude') coordinate.latitude = o._value
                    if (o._field === 'longitude') coordinate.longitude = o._value
                },
                error(error) {
                    reject(error)
                },
                complete() {
                    resolve(coordinates.filter(c => !isNaN(c.latitude) && !isNaN(c.longitude)).map(c => {
                        delete c.timestamp
                        return c
                    }))
                }
            })
        })
    }

    private async getOldestCoordinateTimestamp() {
        const fluxQuery = `from(bucket: "${this.bucket}")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "coordinate")
          |> sort(columns: ["_time"], desc: false)
          |> limit(n:1)`
        return new Promise<number | null>((resolve, reject) => {
            let found = false
            this.queryApi.queryRows(fluxQuery, {
                next: (row, tableMeta) => {
                    found = true
                    const o = tableMeta.toObject(row)
                    resolve(new Date(o._time).getTime())
                },
                error: (err) => reject(err),
                complete: () => {
                    if (!found) resolve(null)
                }
            })
        })
    }
}

export default CoordinateDBService.getInstance()
