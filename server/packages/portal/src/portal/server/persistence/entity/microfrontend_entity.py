import uuid

from sqlalchemy import Column, String, Integer, Boolean, UUID

from ..base import Base

class MicrofrontendEntity(Base):
    __tablename__ = "MICROFRONTEND"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    version_id = Column(Integer, nullable=False, default=0)
    name = Column(String)
    uri = Column(String)
    enabled = Column(Boolean, default=True)
    configuration = Column(String)

    __mapper_args__ = {
        "version_id_col": version_id
    }

    def __repr__(self):
        return f"<MicrofrontentEntity(id={self.id}, name={self.name},  ...)>"
