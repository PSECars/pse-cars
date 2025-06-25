'use server'

const apiUrl = process.env.NEXT_PUBLIC_IOT_URL || 'http://localhost:3002';

async function postCarControl(carId: string, action: string, value: boolean) {
  const allowed = ['lock', 'lights', 'climate', 'heating'];
  if (!allowed.includes(action)) {
    throw new Error(`Action '${action}' is not allowed`);
  }
  if (typeof value !== 'boolean') {
    throw new Error('Payload must be a boolean value');
  }
  // Use dedicated endpoint for each action
  const response = await fetch(`${apiUrl}/car/${carId}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!response.ok) {
    throw new Error(`Failed to publish MQTT message: ${response.statusText}`);
  }
  return await response.json();
}

export async function setCarLock(carId: string, value: boolean) {
  return postCarControl(carId, 'lock', value);
}

export async function setCarLights(carId: string, value: boolean) {
  return postCarControl(carId, 'lights', value);
}

export async function setCarClimate(carId: string, value: boolean) {
  return postCarControl(carId, 'climate', value);
}

export async function setCarHeating(carId: string, value: boolean) {
  return postCarControl(carId, 'heating', value);
}
