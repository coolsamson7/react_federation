import threading
from typing import Optional, List
from uuid import UUID

from aspyx_persistence import get_current_session, transactional

from aspyx.mapper import Mapper, MappingDefinition, matching_properties
from aspyx_service import implementation
from ..interface import PortalCRUDService
from ..interface.portal_model import Microfrontend
from ..server.persistence.entity.microfrontend_entity import MicrofrontendEntity

from .persistence.repository import MicrofrontentRepository

@implementation()
class PortalCRUDServiceImpl(PortalCRUDService):
    # constructor

    def __init__(self, repository: MicrofrontentRepository):
        self.repository = repository
        self.dto_to_entity_mapper : Optional[Mapper] = None
        self.entity_to_dto_mapper : Optional[Mapper] = None


    # internal

    def schedule_later(self, func):
        threading.Timer(0, func).start()

    def get_dto_to_entity_mapper(self):
        if self.dto_to_entity_mapper is None:
            self.dto_to_entity_mapper = Mapper(
                MappingDefinition(source=Microfrontend, target=MicrofrontendEntity)
                    .map(all=matching_properties())
            )

        return self.dto_to_entity_mapper

    def get_entity_to_dto_mapper(self):
        if self.entity_to_dto_mapper is None:
            self.entity_to_dto_mapper = Mapper(
                MappingDefinition(source=MicrofrontendEntity, target=Microfrontend)
                    .map(all=matching_properties())
            )

        return self.entity_to_dto_mapper

    # implement

    @transactional()
    def read_microfrontends(self) -> List[Microfrontend]:
        return self.repository.find_all(self.get_entity_to_dto_mapper())

    def test_get(self, param:str, qp: str) -> Microfrontend:
        pass

    def test_get1(self, param:str, qp: str) -> Microfrontend:
        pass

    @transactional()
    def create_microfrontend(self, microfrontend: Microfrontend) -> Microfrontend:
        entity = self.repository.save(self.get_dto_to_entity_mapper().map(microfrontend))

        # flush session

        get_current_session().flush()

        # return new dto

        return self.get_entity_to_dto_mapper().map(entity)

    @transactional()
    def update_microfrontend(self, mfe: Microfrontend) -> Microfrontend:
        return mfe # TODO

    @transactional()
    def read_microfrontend(self, id: UUID) -> Microfrontend:
        return self.repository.find_by_id(id, self.get_entity_to_dto_mapper())