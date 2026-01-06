from sqlalchemy.orm import DeclarativeBase

from aspyx_persistence import PersistentUnit

class Base(DeclarativeBase):
    pass

class CubePersistentUnit(PersistentUnit):
    def __init__(self, url: str):
        super().__init__(url=url, declarative_base=Base)