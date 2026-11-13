import { getRequiredBearerHeaders } from './api';

export function isValidIpv4Address(address: string): boolean {
  const octets = address.trim().split('.');

  return (
    octets.length === 4 &&
    octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) >= 0 && Number(octet) <= 255)
  );
}

export async function checkEsp32Connection(ipAddress: string): Promise<void> {
  const address = ipAddress.trim();
  if (!isValidIpv4Address(address)) {
    throw new Error('Enter a valid IPv4 address, for example 192.168.1.50.');
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`http://${address}/read`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...getRequiredBearerHeaders(),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`The device responded with HTTP ${response.status} at /read.`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('The device did not respond within 5 seconds. Check its address and network connection.');
    }
    if (error instanceof TypeError) {
      throw new Error('Could not reach the device. Check that it is on this network and allows browser access (CORS).');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
