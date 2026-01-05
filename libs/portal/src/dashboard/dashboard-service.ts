
export interface Dashboard {
    id?: string;          // UUID
    version_id?: number;
    name?: string | null;
    configuration?: string | null;
}

export interface DashboardServiceOptions {
  baseUrl?: string; // optional base URL, defaults to /api/metadata
}

export class DashboardService {
  private baseUrl: string;

  constructor(options?: DashboardServiceOptions) {
    this.baseUrl = options?.baseUrl ?? "http://localhost:8000/api/dashboard/";
  }

  // private

    private async post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest): Promise<TResponse> {
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
        `CubeService ${endpoint} failed: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as TResponse;
  }

  private async get<TResponse>(
      endpoint: string,
      params?: Record<string, string>
    ): Promise<TResponse> {
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
          `CubeService ${endpoint} failed: ${response.status} ${response.statusText}`
        );
      }

      return (await response.json()) as TResponse;
    }

    // implement



 findById(id: string): Promise<Dashboard> {
    return this.get<Dashboard>(`find/${id}`);
  }
  /** POST /create */
  create(dashboard: Dashboard): Promise<Dashboard> {
    return this.post<Dashboard, Dashboard>("create", dashboard);
  }

  /** POST /update */
  update(dashboard: Dashboard): Promise<Dashboard> {
    return this.post<Dashboard, Dashboard>("update", dashboard);
  }

  /** POST /list */
  list(): Promise<Dashboard[]> {
    return this.get<Dashboard[]>("list");
  }
}