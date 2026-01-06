from typing import Optional
from uuid import UUID

from aspyx.di import injectable
from aspyx.mapper import Mapper
from .entity.cube_entity import CubeEntity

from aspyx_persistence import BaseRepository

@injectable()
class CubeRepository(BaseRepository[CubeEntity]):
    # constructor

    def __init__(self):
        super().__init__(CubeEntity)

    # public

    #@query()
    #def find_by_event(self):
    #    ...

    def find_by_id(self, id: UUID, mapper: Optional[Mapper] = None) -> CubeEntity:
        return self.find(id, mapper=mapper)
