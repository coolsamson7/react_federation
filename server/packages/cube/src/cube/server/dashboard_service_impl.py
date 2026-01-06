from typing import List, Optional

from aspyx_persistence import transactional, get_current_session

from aspyx.mapper import MappingDefinition, Mapper, matching_properties
from aspyx_service import implementation

from ..interface.dashboard_service import DashboardService, Dashboard
from .persistence import DashboardRepository
from .persistence.entity import DashboardEntity

@implementation()
class DashboardServiceServiceImpl(DashboardService):
    # slots

    __slots__ = [
        "repository",
        "dto_to_entity_mapper",
        "entity_to_dto_mapper"
    ]

    # constructor

    def __init__(self, repository: DashboardRepository):
        self.repository = repository
        self.dto_to_entity_mapper : Optional[Mapper] = None
        self.entity_to_dto_mapper : Optional[Mapper] = None

    # private

    def get_dto_to_entity_mapper(self):
        if self.dto_to_entity_mapper is None:
            self.dto_to_entity_mapper = Mapper(
                MappingDefinition(source=Dashboard, target=DashboardEntity)
                    .map(all=matching_properties())
            )

        return self.dto_to_entity_mapper

    def get_entity_to_dto_mapper(self):
        if self.entity_to_dto_mapper is None:
            self.entity_to_dto_mapper = Mapper(
                MappingDefinition(source=DashboardEntity, target=Dashboard)
                    .map(all=matching_properties())
            )

        return self.entity_to_dto_mapper

    # implement

    @transactional()
    def create_dashboard(self, dashboard: Dashboard) -> Dashboard:
        entity = self.repository.save(DashboardEntity(name=dashboard.name, configuration=dashboard.configuration))

        # flush session

        get_current_session().flush()

        dashboard.id = entity.id
        dashboard.version_id = entity.version_id

        return dashboard

    @transactional()
    def find_dashboard_by_id(self, id: str) -> Dashboard:
        return self.repository.find(id, self.get_entity_to_dto_mapper())

    @transactional()
    def update_dashboard(self, dashboard: Dashboard) -> Dashboard:
        if dashboard.id is None:
            return self.create_dashboard(dashboard)
        else:
            entity = self.repository.find(dashboard.id)
            entity.configuration = dashboard.configuration

            self.repository.save(entity)

            # flush session

            get_current_session().flush()

            dashboard.version_id = entity.version_id

            return dashboard


    @transactional()
    def list_dashboards(self) -> List[Dashboard]:
        return [e for e in self.repository.find_all(mapper=self.get_entity_to_dto_mapper())]

