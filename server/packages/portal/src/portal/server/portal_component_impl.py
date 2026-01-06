from aspyx.di import on_running
from aspyx.di.aop import advice, error, Invocation
from aspyx.exception import ExceptionManager, catch
from aspyx_service import implementation, health, AbstractComponent, HealthCheckManager, component_services, ChannelAddress, Server
from ..interface import PortalComponent

@implementation()
@health("/portal/health")
@advice
class PortalComponentImpl(AbstractComponent, PortalComponent):
    # constructor

    def __init__(self):
        super().__init__()

        self.exception_manager = ExceptionManager()

    # create

    #@create()
    #def create_persistent_unit(self) -> PortalPersistentUnit:
    #    return PortalPersistentUnit(url="postgresql+psycopg2://postgres:postgres@localhost:5432/postgres")

    # exception handler

    @catch()
    def catch_exception(self, exception: Exception):
        print("caught exception!")
        return exception

    # aspects

    @error(component_services(PortalComponent))
    def catch(self, invocation: Invocation):
        return self.exception_manager.handle(invocation.exception)

    # lifecycle

    @on_running()
    def setup_exception_handlers(self):
        self.exception_manager.collect_handlers(self)

    # implement

    async def get_health(self) -> HealthCheckManager.Health:
        return HealthCheckManager.Health()

    def get_addresses(self, port: int) -> list[ChannelAddress]:
        local_ip = "127.0.0.1" #Server.get_local_ip()
        return [
            ChannelAddress("rest", f"http://{local_ip}:{port}"),
            ChannelAddress("dispatch-json", f"http://{local_ip}:{port}")
        ]

    def startup(self) -> None:
        print("### startup portal component")

    def shutdown(self) -> None:
        print("### shutdown portal component")