import {DatabaseDescriptor} from "@portal/metadata/metadata";

export interface MetadataServiceOptions {
  baseUrl?: string; // optional base URL, defaults to /api/metadata
}

export class MetadataService {
  private baseUrl: string;

  constructor(options?: MetadataServiceOptions) {
    this.baseUrl = options?.baseUrl ?? "http://localhost:8000/api/metadata/";
  }

  /**
   * Fetch the metadata from the backend.
   * @param dialect Optional SQL dialect, defaults to 'postgres'
   */
  async getMetadata(dialect: string = "postgres"): Promise<DatabaseDescriptor> {
    const url = new URL("fetch", this.baseUrl);
    url.searchParams.set("dialect", dialect);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as DatabaseDescriptor;
    return data;
  }
}