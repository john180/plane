# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import ast
from pathlib import Path

import pytest


PLANE_ROOT = Path(__file__).resolve().parents[3]
API_ROOT = PLANE_ROOT.parent


def _source(relative_path: str) -> str:
    return (PLANE_ROOT / relative_path).read_text(encoding="utf-8")


@pytest.mark.unit
def test_event_tracking_task_has_no_external_capture_client():
    source = _source("bgtasks/event_tracking_task.py")
    tree = ast.parse(source)

    blocked_package = "post" + "hog"
    assert blocked_package not in source.lower()
    assert not any(
        isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "capture"
        for node in ast.walk(tree)
    )


@pytest.mark.unit
def test_workspace_flows_do_not_enqueue_legacy_event_task():
    legacy_task_name = "track" + "_event"
    legacy_delay_call = f"{legacy_task_name}.delay"
    workspace_flow_files = [
        "app/views/workspace/base.py",
        "app/views/workspace/invite.py",
        "authentication/utils/workspace_project_join.py",
    ]

    for relative_path in workspace_flow_files:
        source = _source(relative_path)
        tree = ast.parse(source)

        assert legacy_delay_call not in source
        assert not any(
            isinstance(node, ast.ImportFrom)
            and node.module == "plane.bgtasks.event_tracking_task"
            and any(alias.name == legacy_task_name for alias in node.names)
            for node in ast.walk(tree)
        )


@pytest.mark.unit
def test_instance_telemetry_flag_is_not_api_writable():
    from plane.license.api.serializers import InstanceSerializer

    assert "is_telemetry_enabled" in InstanceSerializer.Meta.read_only_fields


@pytest.mark.unit
def test_legacy_metrics_task_is_registered_as_noop():
    from django.conf import settings

    source = _source("license/bgtasks/telemetry_metrics.py")

    assert "plane.license.bgtasks.telemetry_metrics" in settings.CELERY_IMPORTS
    assert "opentelemetry" not in source.lower()
    assert "OTLPMetricExporter" not in source


@pytest.mark.unit
def test_python_otlp_dependencies_are_removed():
    requirements = (API_ROOT / "requirements/base.txt").read_text(encoding="utf-8").lower()

    assert "opentelemetry" not in requirements
    assert not (PLANE_ROOT / "utils/otlp_endpoints.py").exists()
