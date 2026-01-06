import logging
import time
from pathlib import Path

from fastapi import FastAPI

import pytest

from aspyx_service import FastAPIServer, ServiceManager, SessionManager, RequestContext
from aspyx.util import Logger
from aspyx_service.service import LocalComponentRegistry, ComponentRegistry
from aspyx.di import module, create, Environment, ConfigurationManager
from aspyx.di.configuration import YamlConfigurationSource

from cube.interface import CubeComponent
from cube.server import CubeModule
from portal.server import PortalModule
from portal.server.persistence.base import PortalPersistentUnit

# configure logging

Logger.configure(default_level=logging.INFO, levels={
    "httpx": logging.ERROR,
    "aspyx.di": logging.INFO,
    "aspyx.di.aop": logging.ERROR,
    "aspyx.service": logging.INFO,
    "aspyx.event": logging.INFO
})

fastapi = FastAPI()

fastapi.add_middleware(RequestContext)
#fastapi.add_middleware(TokenContextMiddleware)

@module(imports=[CubeModule, PortalModule])
class TestModule:
    @create()
    def create_yaml_source(self) -> YamlConfigurationSource:
        return YamlConfigurationSource(f"{Path(__file__).parent}/config.yaml")

    @create()
    #@inject_value("db.url")
    def create_persistent_unit(self, config: ConfigurationManager) -> PortalPersistentUnit:
        return PortalPersistentUnit(url=config.get("db.url", str))

    @create()
    def create_server(self, service_manager: ServiceManager, component_registry: ComponentRegistry) -> FastAPIServer:
        return FastAPIServer(fastapi, service_manager, component_registry)

    @create()
    def create_session_storage(self) -> SessionManager.Storage:
        return SessionManager.InMemoryStorage(max_size=1000, ttl=3600)

    #@create()
    #def create_token_manager(self) -> TokenManager:
    #    return TokenManager(SECRET_KEY, ALGORITHM, access_token_expiry_minutes = 15, refresh_token_expiry_minutes = 60 * 24)

    @create()
    def create_registry(self, source: YamlConfigurationSource) -> LocalComponentRegistry:
        return LocalComponentRegistry()

# main

def start_environment() -> Environment:
    environment = FastAPIServer.boot(TestModule, host="0.0.0.0", port=8000)

    service_manager = environment.get(ServiceManager)
    descriptor = service_manager.get_descriptor(CubeComponent).get_component_descriptor()

    # Give the server a second to start

    print("wait for server to start")
    while True:
        addresses = service_manager.component_registry.get_addresses(descriptor)
        if addresses:
            break

        print("zzz...")
        time.sleep(1)

    print("server running")

    return environment


@pytest.fixture()
def service_manager():
    environment = start_environment()

    try:
        yield environment.get(ServiceManager)
    finally:
        environment.destroy()