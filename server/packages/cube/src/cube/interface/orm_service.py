from abc import abstractmethod

from aspyx_service import service, Service, rest, get

from .orm_descriptors import DatabaseDescriptor

@service(name="metadata-service", description="metadata stuff")
@rest("/api/metadata/")
class MetadataService(Service):
    """
    The portal service exposes portal data.
    """

    @abstractmethod
    @get("fetch")
    def get_metadata(self, dialect: str = "postgres") -> DatabaseDescriptor:
        pass
