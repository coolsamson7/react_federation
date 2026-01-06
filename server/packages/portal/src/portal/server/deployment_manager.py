from __future__ import annotations

import dataclasses
from typing import Dict, List
from abc import ABC

import json

from aspyx.di import injectable, inject

from ..interface.portal_crud_service import PortalCRUDService
from ..interface.portal_model import Deployment, Manifest, Feature, DeploymentRequest, ClientInfo, ClientConstraints

from .permission_manager import PermissionManager
from .feature_manager import FeatureManager

@dataclasses.dataclass
class FilterContext:
    has_session: bool
    client_info: ClientInfo = None


class ManifestFilter(ABC):
    def accept(self, manifest: Manifest, context: FilterContext) -> bool:
        return True

class AbstractManifestFilter(ManifestFilter):
    @inject()
    def set_deployment_manager(self, manager: DeploymentManager):
        manager.register_manifest_filter(self)

class FeatureFilter(ABC):
    def accept(self, feature: Feature, context: FilterContext) -> bool:
        return True

class AbstractFeatureFilter(FeatureFilter):
    @inject()
    def set_deployment_manager(self, manager: DeploymentManager):
        manager.register_feature_filter(self)

@injectable()
class TestManifestFilter(AbstractManifestFilter):
    pass

@injectable()
class TestFeatureFilter(AbstractFeatureFilter):
    def accept(self, feature: Feature, context: FilterContext) -> bool:
        # Check if feature is enabled and has required permissions/tags
        if not feature.enabled:
            return False

        # Reject features with "secret" tag
        if "secret" in feature.tags:
            return False

        return True

@injectable()
class PermissionFeatureFilter(AbstractFeatureFilter):
    def __init__(self, permission_manager: PermissionManager):
        self.permission_manager = permission_manager

    def accept(self, feature: Feature, context: FilterContext) -> bool:
        # Check if user has all required permissions for this feature
        if not feature.permissions:
            return True  # No permissions required
        return all(self.permission_manager.has_permission(perm) for perm in feature.permissions)


@injectable()
class FeatureFeatureFilter(AbstractFeatureFilter):
    def __init__(self, feature_manager: FeatureManager):
        self.feature_manager = feature_manager

    def accept(self, feature: Feature, context: FilterContext) -> bool:
        # Check if all required features are enabled
        if not feature.features:
            return True  # No feature dependencies
        return all(self.feature_manager.has_feature(feat) for feat in feature.features)


@injectable()
class DeploymentManager:
    # properties

    microfrontends : Dict[str, Manifest] = {}
    manifest_filter : List[ManifestFilter] = []
    feature_filter  : List[ManifestFilter] = []

    # constructor

    def __init__(self, crud_service: PortalCRUDService):
        self.crud_service = crud_service

    #

    def register_manifest_filter(self, filter: ManifestFilter):
        self.manifest_filter.append(filter)

    def register_feature_filter(self, filter: ManifestFilter):
        self.feature_filter.append(filter)

    # internal

    def _matches_constraints(self, feature: Feature, client_info: ClientInfo) -> bool:
        """Check if a feature's constraints match the client info"""
        if not feature.clients:
            return True

        constraints = feature.clients

        # Check screen sizes
        if constraints.screen_sizes and client_info.screen_size not in constraints.screen_sizes:
            return False

        # Check orientation
        if constraints.orientation and client_info.orientation not in constraints.orientation:
            return False

        # Check platforms
        if constraints.platforms and client_info.platform not in constraints.platforms:
            return False

        # Check width constraints
        if constraints.min_width is not None and client_info.width < constraints.min_width:
            return False
        if constraints.max_width is not None and client_info.width > constraints.max_width:
            return False

        # Check height constraints
        if constraints.min_height is not None and client_info.height < constraints.min_height:
            return False
        if constraints.max_height is not None and client_info.height > constraints.max_height:
            return False

        # Check capabilities (client must have all required capabilities)
        if constraints.capabilities:
            if not all(cap in client_info.capabilities for cap in constraints.capabilities):
                return False

        return True

    def _filter_manifests(self, context: FilterContext) -> List[Manifest]:
        filtered_manifests = []

        for manifest in self.microfrontends.values():
            # Check if manifest passes all filters
            if all(f.accept(manifest, context) for f in self.manifest_filter):
                # Filter features for this manifest
                filtered_features = []
                seen_paths = set()  # Track feature paths we've already added (for route features)
                seen_ids = set()  # Track feature IDs we've already added (for non-route features like navigation)

                for feature in manifest.features:
                    # Check if feature passes all filters first
                    if not all(f.accept(feature, context) for f in self.feature_filter):
                        continue

                    # Check client constraints if client_info is provided
                    if context.client_info and not self._matches_constraints(feature, context.client_info):
                        continue

                    # For features without a path (e.g., navigation), deduplicate by ID
                    # Treat None or empty string as non-route features
                    # Only the first matching feature with this ID will be added
                    if not feature.path:  # None or empty string
                        if feature.id in seen_ids:
                            continue
                        seen_ids.add(feature.id)
                    else:
                        # For route features, deduplicate by path
                        # Only the first matching feature with this path will be added
                        if feature.path in seen_paths:
                            continue
                        seen_paths.add(feature.path)

                    # Add the first matching feature
                    filtered_features.append(feature)

                # Create a copy of the manifest with filtered features
                filtered_manifest = Manifest(
                    name=manifest.name,
                    uri=manifest.uri,
                    module=manifest.module,
                    features=filtered_features
                )
                filtered_manifests.append(filtered_manifest)

        return filtered_manifests

    # life cycle

    #TODO FOO @on_running()
    def on_init(self):
        for mfe in self.crud_service.read_microfrontends():
            if mfe.enabled:
                json_payload = json.loads(mfe.configuration)

                # Parse features directly using Pydantic to respect aliases
                features = [Feature.model_validate(f) for f in json_payload.get('features', [])]

                manifest = Manifest(
                    name=mfe.name,
                    uri= mfe.uri,
                    module= "module", #??
                    features= features
                )

                self.microfrontends[manifest.name] = manifest

                print(manifest)


    # public

    def create_deployment(self, request: DeploymentRequest) -> Deployment:
        print(request.client_info)

        context = FilterContext(
            has_session=False,  # TODO: determine actual session state
            client_info=request.client_info
        )
        filtered_manifests = self._filter_manifests(context)

        # Convert list to dict with manifest name as key
        modules_dict = {manifest.name: manifest for manifest in filtered_manifests}

        print(modules_dict)

        return Deployment(
            modules=modules_dict
        )