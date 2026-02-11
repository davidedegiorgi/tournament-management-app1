import myEnv from './env';

export type BackendResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  message: string;
}

export async function myFetch<T>(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const res = await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
    const resJson: BackendResponse<T> = await res.json();
    if (!resJson.success) {
      throw new Error(resJson.message);
    }
    return resJson.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Errore generico');
  }
}

export const getLogoUrl = (logoPath: string | null | undefined): string | undefined => {
  if (!logoPath) return undefined;
  if (logoPath.startsWith('http')) return logoPath;
  return `${myEnv.backendUrl}${logoPath}`;
};
