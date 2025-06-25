'use server';

import {getOpenApiClient} from "@/app/http-client/open-api-client";

export async function getSavedCars() {
  const openApiClient = await getOpenApiClient();
  const response = await openApiClient!.getAllSavedCars();
  if (response.status > 200) {
    throw new Error('Failed to fetch saved cars');
  }
  return response.data;
}

export async function saveCar(body: any) {
  const openApiClient = await getOpenApiClient();
  const response = await openApiClient!.saveCar({}, body);
  if (response.status > 201) {
    throw new Error('Failed to save car');
  }
  return response.data;
}

export async function deleteSavedCar(id: string) {
  const openApiClient = await getOpenApiClient();
  const response = await openApiClient!.deleteSavedCar(id);
  if (response.status > 204) {
    throw new Error('Failed to delete car');
  }
  return response.data;
}
