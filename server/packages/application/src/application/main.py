import logging
import uvicorn
from fastapi import FastAPI

from aspyx.di import module, create

from aspyx.util import Logger

from cube.server import CubeModule

# setup logging

Logger.configure(default_level=logging.INFO, levels={
    "httpx": logging.ERROR,
    "aspyx.di": logging.DEBUG,
    "aspyx.event": logging.DEBUG,
    "aspyx.service": logging.DEBUG
})

from aspyx_service.service import LocalComponentRegistry, ComponentRegistry
from portal.server import PortalModule
from portal.server.persistence.base import PortalPersistentUnit

from aspyx_service import RequestContext, FastAPIServer, ServiceManager, SessionManager


from starlette.middleware.cors import CORSMiddleware

# create the application

app = FastAPI()

@module(imports=[PortalModule, CubeModule])
class ApplicationModule:
    @create()
    def create_persistent_unit(self) -> PortalPersistentUnit:
        return PortalPersistentUnit(url="postgresql+psycopg2://postgres:postgres@localhost:5432/postgres")

    @create()
    def create_server(self, service_manager: ServiceManager, component_registry: ComponentRegistry) -> FastAPIServer:
        return FastAPIServer(app, service_manager, component_registry)

    @create()
    def create_session_storage(self) -> SessionManager.Storage:
        return SessionManager.InMemoryStorage(max_size=1000, ttl=3600)

    # @create()
    # def create_token_manager(self) -> TokenManager:
    #    return TokenManager(SECRET_KEY, ALGORITHM, access_token_expiry_minutes = 15, refresh_token_expiry_minutes = 60 * 24)

    #@create()
    #def create_yaml_source(self) -> YamlConfigurationSource:
    #    return YamlConfigurationSource(f"{Path(__file__).parent}/config.yaml")

    @create()
    def create_registry(self) -> LocalComponentRegistry:
        return LocalComponentRegistry()


app.add_middleware(CORSMiddleware,
            allow_origins=[
                "http://localhost",
                "http://localhost:3000",
                "http://127.0.0.1",
                "http://127.0.0.1:3000",
                "*"
            ],
            allow_credentials=True,
            allow_methods=["POST", "GET", "PUT", "DELETE", "OPTIONS"],
            allow_headers=["*"],
            expose_headers=["*"],#?
        )
app.add_middleware(RequestContext)
#app.add_middleware(TokenContextMiddleware)

ApplicationModule.app = app

FastAPIServer.boot(ApplicationModule, host="0.0.0.0", port=8000, start_thread=False)

# run server

if __name__ == "__main__":
    #PersistentUnit.get_persistent_unit(Base).create_all()
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)