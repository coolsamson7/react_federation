from abc import abstractmethod

from aspyx_service import service, Service, rest, post, Body
from .portal_model import Deployment, DeploymentRequest

@service(name="portal-service", description="portal stuff")
@rest("/portal/")
class PortalService(Service):
    """
    The portal service exposes portal data.
    """

    @abstractmethod
    @post("deployment")
    def compute_deployment(self, request: Body(DeploymentRequest)) -> Deployment:
        pass




