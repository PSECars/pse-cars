import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { Coordinate } from '../types/Coordinate'

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
   * Load all coordinates from the InfluxDB.
   * @returns Array of coordinates with timestamps
   */
  async loadAllCoordinates(): Promise<{ latitude: number; longitude: number; timestamp: number }[]> {
    const queryApi = this.influxDB.getQueryApi(this.org)
    const fluxQuery = `from(bucket: "${this.bucket}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "coordinate")`
    const coordinates: { latitude: number; longitude: number; timestamp: number }[] = []
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row)
          if (o._field === 'latitude' || o._field === 'longitude') {
            let coord = coordinates.find(c => c.timestamp === new Date(o._time).getTime())
            if (!coord) {
              coord = { latitude: NaN, longitude: NaN, timestamp: new Date(o._time).getTime() }
              coordinates.push(coord)
            }
            if (o._field === 'latitude') coord.latitude = o._value
            if (o._field === 'longitude') coord.longitude = o._value
          }
        },
        error(error) {
          reject(error)
        },
        complete() {
          resolve(coordinates.filter(c => !isNaN(c.latitude) && !isNaN(c.longitude)))
        }
      })
    })
  }

  /**
   * Load the latest coordinate from the InfluxDB.
   * @returns The latest coordinate with timestamp, or null if none found
   */
  async loadLatestCoordinate(): Promise<{ latitude: number; longitude: number; timestamp: number } | null> {
    const queryApi = this.influxDB.getQueryApi(this.org)
    const fluxQuery = `from(bucket: "${this.bucket}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "coordinate") |> sort(columns: ["_time"], desc: true) |> limit(n:2)`
    const latest: { latitude: number; longitude: number; timestamp: number } = { latitude: NaN, longitude: NaN, timestamp: NaN }
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
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
}

export default CoordinateDBService.getInstance()
