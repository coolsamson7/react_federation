from typing import Optional
from uuid import UUID

from aspyx.di import injectable
from aspyx.mapper import Mapper

from ...interface.portal_model import Microfrontend

from .entity import MicrofrontendEntity
from aspyx_persistence import BaseRepository

@injectable()
class MicrofrontentRepository(BaseRepository[MicrofrontendEntity]):
    # constructor

    def __init__(self):
        super().__init__(MicrofrontendEntity)

    # public

    #@query()
    #def find_by_event(self):
    #    ...

    def find_by_id(self, id: UUID, mapper: Optional[Mapper] = None) -> Microfrontend:
        return self.find(id, mapper=mapper)
