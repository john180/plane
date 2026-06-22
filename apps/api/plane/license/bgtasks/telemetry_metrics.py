# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import logging

# Third party imports
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task
def push_instance_metrics():
    """Legacy task name retained as a no-op for old queued messages."""
    logger.debug("Instance telemetry metrics are disabled; skipping legacy task")
