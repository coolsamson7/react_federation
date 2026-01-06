from abc import abstractmethod
from typing import List
from aspyx_service import service, Service, rest, get, post, Body

from .cube_descriptors import CubeDescriptor


@service(name="cube-service", description="metadata stuff")
@rest("/api/cube/")
class CubeService(Service):
    """
    The portal service exposes cube data.
    """

    @abstractmethod
    @post("create")
    def create_cube(self, cube: Body(CubeDescriptor)) -> CubeDescriptor:
        pass

    @abstractmethod
    @post("update")
    def update_cube(self, cube: Body(CubeDescriptor)) -> CubeDescriptor:
        pass

    @abstractmethod
    @get("list")
    def list_cubes(self) -> List[CubeDescriptor]:
        pass

    @abstractmethod
    @post("deploy")
    def deploy_cube(self, cube: Body(CubeDescriptor)):
        pass