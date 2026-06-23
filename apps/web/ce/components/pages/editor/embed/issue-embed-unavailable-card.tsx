/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { cn } from "@plane/utils";

export function IssueEmbedUnavailableCard(props: any) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-5 rounded-md border-[0.5px] border-subtle bg-layer-1 px-5 py-2 shadow-raised-100 max-md:flex-wrap",
        {
          "border-2": props.selected,
        }
      )}
    >
      <div className="flex items-center gap-4">
        <p className="!text-14 text-secondary">Embedding work items in pages is not enabled in this build.</p>
      </div>
    </div>
  );
}
