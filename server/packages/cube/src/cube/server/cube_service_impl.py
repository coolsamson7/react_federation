import json
from typing import List

from aspyx_persistence import transactional, get_current_session

from aspyx_service import implementation

from ..interface.cube_service import CubeService
from .cube.cube_generator import generate_cube_js
from ..interface import CubeDescriptor

from .persistence import CubeRepository
from .persistence.entity import CubeEntity

@implementation()
class CubeServiceServiceImpl(CubeService):
    # slots

    __slots__ = [
        "repository"
    ]

    # constructor

    def __init__(self, repository: CubeRepository):
        self.repository = repository

    # implement CubeService

    @transactional()
    def create_cube(self, cube: CubeDescriptor) -> CubeDescriptor:
        json = cube.model_dump_json()

        self.deploy_cube(cube)

        entity = self.repository.save(CubeEntity(name=cube.name, configuration=json))

        # flush session

        get_current_session().flush()

        return cube

    @transactional()
    def update_cube(self, cube: CubeDescriptor) -> CubeDescriptor:
        pass# self.repository.get(cube.name)

    @transactional()
    def list_cubes(self) -> List[CubeDescriptor]:
        def create(entity: CubeEntity) -> CubeDescriptor:
            return CubeDescriptor(**json.loads(entity.configuration))

        return [ create(e) for e in self.repository.find_all()]

    @transactional()
    def deploy_cube(self, cube: CubeDescriptor):
        js = generate_cube_js(cube)

        print(js)

        #console.log(cube)

