import {HTTPService} from "@portal/communication";
import { CubeDescriptor } from "./cube-metadata";


export class CubeService extends HTTPService {
   constructor(options?: any) {
       super();
    this.baseUrl = options?.baseUrl ?? "http://localhost:8000/api/cube/";
  }

  /** POST /create */
  createCube(cube: CubeDescriptor): Promise<CubeDescriptor> {
    return this.post<CubeDescriptor, CubeDescriptor>("create", cube);
  }

  /** POST /update */
  updateCube(cube: CubeDescriptor): Promise<CubeDescriptor> {
    return this.post<CubeDescriptor, CubeDescriptor>("update", cube);
  }

  /** POST /list */
  listCubes(): Promise<CubeDescriptor[]> {
    return this.get<CubeDescriptor[]>("list");
  }

  /** POST /deploy */
  async deployCube(cube: CubeDescriptor): Promise<void> {
    await this.post<CubeDescriptor, unknown>("deploy", cube);
  }
}