# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest

from plane.license.management.commands.register_instance import Command


@pytest.mark.unit
class TestRegisterInstanceVersionCheck:
    def test_latest_version_defaults_to_current_without_network(self, monkeypatch):
        monkeypatch.delenv("ENABLE_UPDATE_CHECK", raising=False)

        def fail_if_called(*args, **kwargs):
            raise AssertionError("GitHub latest-version check should be disabled by default")

        monkeypatch.setattr("plane.license.management.commands.register_instance.requests.get", fail_if_called)

        assert Command().check_for_latest_version("v1.2.3") == "v1.2.3"

    def test_latest_version_uses_github_when_explicitly_enabled(self, monkeypatch):
        monkeypatch.setenv("ENABLE_UPDATE_CHECK", "1")

        class Response:
            def raise_for_status(self):
                return None

            def json(self):
                return {"tag_name": "v9.9.9"}

        monkeypatch.setattr(
            "plane.license.management.commands.register_instance.requests.get",
            lambda *args, **kwargs: Response(),
        )

        assert Command().check_for_latest_version("v1.2.3") == "v9.9.9"

    def test_latest_version_falls_back_when_enabled_check_fails(self, monkeypatch):
        monkeypatch.setenv("ENABLE_UPDATE_CHECK", "1")
        monkeypatch.setattr(
            "plane.license.management.commands.register_instance.requests.get",
            lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("offline")),
        )

        assert Command().check_for_latest_version("v1.2.3") == "v1.2.3"
