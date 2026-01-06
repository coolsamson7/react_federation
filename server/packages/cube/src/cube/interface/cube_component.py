from aspyx_service import component, Component

from .cube_service import CubeService
from .orm_service import MetadataService
from .dashboard_service import DashboardService

@component(services =[
    CubeService,
    MetadataService,
    DashboardService
])
class CubeComponent(Component):
    """
    The component hosting the cube, orm and dashboard service
    """
    pass