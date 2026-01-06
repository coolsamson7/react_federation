from aspyx.di import injectable

@injectable()
class FeatureManager:
    def __init__(self):
        pass

    def has_feature(self, feature: str) -> bool:
        return feature == "feature-a"