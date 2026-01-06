from aspyx_service import implementation

from ..interface import PortalService
from ..interface.portal_model import Deployment, DeploymentRequest
from .deployment_manager import DeploymentManager

@implementation()
class PortalServiceImpl(PortalService):
    # constructor

    def __init__(self, manager: DeploymentManager):
        self.manager = manager

    # implement

    def compute_deployment(self, request: DeploymentRequest) -> Deployment:
        return self.manager.create_deployment(request)


