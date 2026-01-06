from aspyx_service import implementation

from ..interface import MetadataService
from ..interface.orm_descriptors import DatabaseDescriptor
from .orm.sqlalchemy_orm_extractor import extract_all_entities
from .persistence.base import Base

@implementation()
class MetadataServiceServiceImpl(MetadataService):
    # slots

    __slots__ = [
    ]

    # constructor

    def __init__(self):
        pass #self.event_manager = event_manager

    # implement MetadataService

    def get_metadata(self, dialect: str = "postgres") -> DatabaseDescriptor:
        return extract_all_entities(Base, dialect = dialect)