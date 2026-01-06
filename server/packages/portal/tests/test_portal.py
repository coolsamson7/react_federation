from uuid import UUID, uuid4

from aspyx_persistence import PersistentUnit

from portal.interface import PortalCRUDService, PortalService
from portal.interface.portal_model import Microfrontend
from portal.server.deployment_manager import DeploymentRequest
from portal.server.persistence.base import PortalPersistentUnit, Base

from .setup import service_manager

MFE_CONFIGURATION = """{
  "id": "mfe1",
  "label": "MFE1 Module",
  "version": "1.0.0",
  "features": [
    {
      "id": "mfe1-home",
      "label": "MFE1 Home",
      "path": "/mfe1",
      "component": "MFE1Home",
      "sourceFile": "apps/mfe1/src/MFE1Home.tsx",
      "icon": "🏠",
      "description": "Home page of MFE1 module",
      "meta": {
        "requiresAuth": false
      }
    },
    {
      "id": "mfe1-foo",
      "label": "Foo Page",
      "path": "/mfe1/foo",
      "component": "MFE1Foo",
      "sourceFile": "apps/mfe1/src/MFE1Foo.tsx",
      "icon": "📄",
      "description": "Foo feature page",
      "meta": {
        "requiresAuth": false
      }
    },
    {
      "id": "mfe1-bar",
      "label": "Bar Page",
      "path": "/mfe1/bar",
      "component": "MFE1Bar",
      "sourceFile": "apps/mfe1/src/MFE1Bar.tsx",
      "icon": "🎯",
      "description": "Bar feature page",
      "meta": {
        "requiresAuth": false
      }
    }
  ],
  "moduleName": "MFE1Module",
  "sourceFile": "apps/mfe1/src/Module.ts",
  "description": "MFE1 Micro Frontend Module"
}"""

class TestPortal:
    def xtest_create_tables(self, service_manager):
        PersistentUnit.get_persistent_unit(Base).create_all()

    def xtest_create_data(self, service_manager):
        service = service_manager.get_service(PortalCRUDService)
    
        service.create_microfrontend(Microfrontend(
            id=uuid4(),
            version_id=0,
            name="mfe1",
            uri="http://localhost:3000",
            enabled=True,
            configuration=MFE_CONFIGURATION
        ))

    def xtest_read_data(self, service_manager):
        service = service_manager.get_service(PortalCRUDService)

        mfes = service.read_microfrontends()
        print("s")

    def xtest_deployment(self, service_manager):
        service = service_manager.get_service(PortalService)

        deployment = service.compute_deployment(DeploymentRequest(application="foo"))

        print(deployment)