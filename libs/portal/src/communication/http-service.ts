
export interface HTTPServiceOptions {
  baseUrl?: string; // optional base URL, defaults to /api/metadata
}

export class HTTPService {
    protected baseUrl: string;

    constructor(options?: HTTPServiceOptions) {
        this.baseUrl = options?.baseUrl ?? "http://localhost:8000/api/cube/";
    }

    // protected

    protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        const url = new URL(endpoint, this.baseUrl);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.set(key, value);
            });
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(
                `${endpoint} failed: ${response.status} ${response.statusText}`
            );
        }

        return (await response.json()) as T;
    }

    protected async post<B, T>(endpoint: string, body: B): Promise<T> {
        const url = new URL(endpoint, this.baseUrl);

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(
                `${endpoint} failed: ${response.status} ${response.statusText}`
            );
        }

        return (await response.json()) as T;
    }
}