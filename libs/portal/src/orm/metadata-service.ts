import {DatabaseDescriptor} from "./metadata";
import {HTTPService} from "@portal/communication";

export interface MetadataServiceOptions {
  baseUrl?: string; // optional base URL, defaults to /api/metadata
}
export class MetadataService extends HTTPService {
  constructor(options?: MetadataServiceOptions) {
      super();
    this.baseUrl = options?.baseUrl ?? "http://localhost:8000/api/metadata/";
  }

  /**
   * Fetch the metadata from the backend.
   * @param dialect Optional SQL dialect, defaults to 'postgres'
   */
  async getMetadata(dialect: string = "postgres"): Promise<DatabaseDescriptor> {
    return super.get<DatabaseDescriptor>("fetch", {dialect: dialect});
  }
}