from abc import abstractmethod
from uuid import UUID
from typing import List

from .portal_model import Microfrontend

from aspyx_service import service, Service, rest, get, post, Body, QueryParam

@service(description="portal stuff")
@rest("/portal/microfrontend/")
class PortalCRUDService(Service):
    """
    The portal service exposes portal data.
    """

    # CRUD

    @abstractmethod
    @post("create", description="create a new portal entry", tags=["portal"])
    def create_microfrontend(self, mfe : Body(Microfrontend, description="desc", example="eample")) -> Microfrontend:
        pass

    @abstractmethod
    @post("update", description="update a portal entry", tags=["portal"])
    def update_microfrontend(self, mfe: Microfrontend) -> Microfrontend:
        pass

    @abstractmethod
    @post("read", tags=["portal"])
    def read_microfrontend(self, id: UUID) -> Microfrontend:
        """
        asdasdasd

        asdasdasd
        Args:
            id:

        Returns:

        """
        pass

    @abstractmethod
    @get("read_all", description="read all portal entries", tags=["portal"])
    def read_microfrontends(self) -> List[Microfrontend]:
        pass

    # TES TSTUFF

    @get("get/{param}", description="get description", tags=["portal"])
    def test_get(self, param: str, qp: QueryParam(str, description="query param description", example="qp example")) -> Microfrontend:
        pass

    @get("get1/{param}", tags=["portal"])
    def test_get1(self, param: str, qp: str) -> Microfrontend:
        """
        What fun!
        Tis is!

        bla bla bla

        Args:
            param: funny param
            qp:  yea yea

        Returns:
            a microfronte
        """
        pass




