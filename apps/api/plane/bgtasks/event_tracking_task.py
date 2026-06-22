# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import logging
import uuid
from typing import Dict, Any

# third party imports
from celery import shared_task


logger = logging.getLogger("plane.worker")


@shared_task
def track_event(user_id: uuid.UUID, event_name: str, slug: str, event_properties: Dict[str, Any]):
    """Legacy task retained as a no-op for old queued messages."""
    logger.debug("Event tracking is disabled; skipping legacy task")
