from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import List, Dict, Optional, Literal


class ClientConstraints(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='allow')

    screen_sizes: Optional[List[str]] = Field(None, validation_alias='screenSizes')
    orientation: Optional[List[str]] = None
    platforms: Optional[List[str]] = None
    min_width: Optional[int] = Field(None, validation_alias='minWidth')
    max_width: Optional[int] = Field(None, validation_alias='maxWidth')
    min_height: Optional[int] = Field(None, validation_alias='minHeight')
    max_height: Optional[int] = Field(None, validation_alias='maxHeight')
    capabilities: Optional[List[str]] = None


class ClientInfo(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='allow')

    # Screen Information
    width: int
    height: int
    screen_size: str = Field(validation_alias='screenSize')
    orientation: str
    pixel_ratio: float = Field(validation_alias='pixelRatio')

    # Platform Information
    platform: str
    browser: str
    os: str
    os_version: str = Field(validation_alias='osVersion')

    # Capabilities
    capabilities: List[str]

    # Device Type (informational)
    device_type: Optional[Literal["phone", "tablet", "desktop"]] = Field(None, validation_alias='deviceType')


class DeploymentRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='allow')

    application: str
    client_info: ClientInfo = Field(validation_alias='client')


class Microfrontend(BaseModel):
    id: UUID
    version_id: int
    name: str
    uri: str
    enabled: bool
    configuration: str

class Feature(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='allow')

    id: str
    label: str
    path: Optional[str] = None
    icon: str
    enabled: bool = True
    component: str
    tags: List[str]
    permissions: List[str]
    features: List[str]
    clients: Optional[ClientConstraints] = Field(None, validation_alias='clients')

class Manifest(BaseModel):
    name: str
    #type: str
    #version: str
    uri: str
    module: str
    features: List[Feature]


class Deployment(BaseModel):
    modules: Dict[str, Manifest]
