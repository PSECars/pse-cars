'use server'

export async function sendMqttEvent(carId: string, action: string, value: boolean) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_IOT_URL || 'http://localhost:3002';
    
    // Format the topic to follow car/{carId}/{action} pattern
    const topic = `car/${carId}/${action}`;
    
    console.log(`Sending MQTT event to ${topic}: ${value}`);
    
    const response = await fetch(`${apiUrl}/mqtt/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        payload: value,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish MQTT message: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending MQTT event:', error);
    throw error;
  }
}
