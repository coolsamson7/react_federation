from aspyx.di import module

from aspyx_persistence import PersistenceModule
from aspyx_service import ServiceModule

@module(imports=[PersistenceModule, ServiceModule])
class PortalModule:
    pass