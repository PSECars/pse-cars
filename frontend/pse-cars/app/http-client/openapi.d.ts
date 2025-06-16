import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios';

declare namespace Components {
    namespace Schemas {
        export interface CarFeature {
            id?: number; // int32
            name?: string;
            variants?: string[];
        }
        export interface ChosenCarFeature {
            id?: string;
            feature?: CarFeature;
            variant?: string;
        }
        export interface OfferedCar {
            id?: number; // int32
            name?: string;
            slogan?: string;
            available?: boolean;
            features?: CarFeature[];
            imageUrl?: string;
        }
        export interface SavedCar {
            id?: string;
            features?: ChosenCarFeature[];
        }
    }
}
declare namespace Paths {
    namespace GetOfferedCarById {
        namespace Parameters {
            export type Id = number; // int32
        }
        export interface PathParameters {
            id: Parameters.Id /* int32 */;
        }
    }
    namespace SaveCar {
        export type RequestBody = Components.Schemas.SavedCar;
    }
}


export interface OperationMethods {
  /**
   * getAllSavedCars
   */
  'getAllSavedCars'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * saveCar
   */
  'saveCar'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.SaveCar.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getAllOfferedCars
   */
  'getAllOfferedCars'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getOfferedCarById
   */
  'getOfferedCarById'(
    parameters?: Parameters<Paths.GetOfferedCarById.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
}

export interface PathsDictionary {
  ['/saved-cars']: {
    /**
     * getAllSavedCars
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
    /**
     * saveCar
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.SaveCar.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/offered-cars']: {
    /**
     * getAllOfferedCars
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/offered-cars/{id}']: {
    /**
     * getOfferedCarById
     */
    'get'(
      parameters?: Parameters<Paths.GetOfferedCarById.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>


export type CarFeature = Components.Schemas.CarFeature;
export type ChosenCarFeature = Components.Schemas.ChosenCarFeature;
export type OfferedCar = Components.Schemas.OfferedCar;
export type SavedCar = Components.Schemas.SavedCar;
