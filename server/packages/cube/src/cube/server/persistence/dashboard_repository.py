from typing import Optional
from uuid import UUID

from aspyx.di import injectable
from aspyx.mapper import Mapper

from .entity import DashboardEntity
from aspyx_persistence import BaseRepository

@injectable()
class DashboardRepository(BaseRepository[DashboardEntity]):
    # constructor

    def __init__(self):
        super().__init__(DashboardEntity)

    # public

    #@query()
    #def find_by_event(self):
    #    ...

    def find_by_id(self, id: UUID, mapper: Optional[Mapper] = None) -> DashboardEntity:
        return self.find(id, mapper=mapper)
