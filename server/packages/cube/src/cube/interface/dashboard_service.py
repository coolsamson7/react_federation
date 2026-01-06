from abc import abstractmethod
from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from typing import List
from aspyx_service import service, Service, rest, get, post, Body

class Dashboard(BaseModel):
    id:  Optional[UUID] = None
    version_id: Optional[int] = None
    name: str
    configuration: str

@service(name="dashboard-service", description="dashboard stuff")
@rest("/api/dashboard/")
class DashboardService(Service):
    """
    The portal service exposes cube data.
    """

    @abstractmethod
    @post("create")
    def create_dashboard(self, dashboard: Body(Dashboard)) -> Dashboard:
        pass

    @abstractmethod
    @get("find/{id}")
    def find_dashboard_by_id(self, id: str) -> Dashboard:
        pass

    @abstractmethod
    @post("update")
    def update_dashboard(self, dashboard: Body(Dashboard)) -> Dashboard:
        pass

    @abstractmethod
    @get("list")
    def list_dashboards(self) -> List[Dashboard]:
        pass


