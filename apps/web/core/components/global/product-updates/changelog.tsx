/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { ProductUpdatesFallback } from "@/components/global/product-updates/fallback";
import { useInstance } from "@/hooks/store/use-instance";

export const ProductUpdatesChangelog = observer(function ProductUpdatesChangelog() {
  // store hooks
  const { config } = useInstance();
  // derived values
  const changeLogUrl = config?.instance_changelog_url;

  return (
    <ProductUpdatesFallback
      description={
        changeLogUrl
          ? "Product updates are available from the configured changelog."
          : "Product updates are not bundled with this instance."
      }
      changelogUrl={changeLogUrl}
    />
  );
});
