from aspyx_service import component, Component

from .portal_service import PortalService
from .portal_crud_service import PortalCRUDService
from. chat_service import ChatService

@component(services =[
    PortalService,
    ChatService,
    PortalCRUDService
])
class PortalComponent(Component):
    """
    The component hosting the portal service
    """
    pass