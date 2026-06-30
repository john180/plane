# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest
from rest_framework import status

from plane.db.models import Project, ProjectMember, State, StateGroup


@pytest.mark.contract
class TestStateAPI:
    def get_intake_state_url(self, workspace_slug, project_id):
        return f"/api/workspaces/{workspace_slug}/projects/{project_id}/intake-state/"

    def create_project(self, workspace, user, name="Test Project", identifier="TP"):
        project = Project.objects.create(name=name, identifier=identifier, workspace=workspace)
        ProjectMember.objects.create(project=project, member=user, role=20, is_active=True)
        return project

    @pytest.mark.django_db
    def test_get_intake_state_creates_missing_triage_state(self, session_client, workspace, create_user):
        project = self.create_project(workspace=workspace, user=create_user)

        assert not State.triage_objects.filter(project=project).exists()

        response = session_client.get(self.get_intake_state_url(workspace.slug, project.id))

        assert response.status_code == status.HTTP_200_OK
        response_data = response.json()
        assert response_data["name"] == "Triage"
        assert response_data["group"] == StateGroup.TRIAGE.value
        assert response_data["project_id"] == str(project.id)
        assert State.triage_objects.filter(project=project).count() == 1

    @pytest.mark.django_db
    def test_get_intake_state_handles_existing_non_triage_state_named_triage(
        self, session_client, workspace, create_user
    ):
        project = self.create_project(workspace=workspace, user=create_user)
        State.objects.create(
            name="Triage",
            color="#60646C",
            sequence=15000,
            group=StateGroup.BACKLOG.value,
            project=project,
            workspace=workspace,
        )

        response = session_client.get(self.get_intake_state_url(workspace.slug, project.id))

        assert response.status_code == status.HTTP_200_OK
        response_data = response.json()
        assert response_data["name"].startswith("Triage-")
        assert response_data["group"] == StateGroup.TRIAGE.value
        assert State.triage_objects.filter(project=project).count() == 1
