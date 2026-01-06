from aspyx.di import injectable


@injectable()
class PermissionManager:
    def __init__(self):
        pass

    def has_permission(self, feature: str) -> bool:
        return feature == "permission-a"