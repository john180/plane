/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane imports
import type { TOAuthConfigs } from "@plane/types";
// local imports
import { useCoreOAuthConfig, type TOAuthButtonTextResolver } from "./core";
import { useExtendedOAuthConfig } from "./extended";

const defaultOAuthButtonTextResolver: TOAuthButtonTextResolver = (provider) => `Continue with ${provider}`;

export const useOAuthConfig = (
  getOAuthButtonText: TOAuthButtonTextResolver = defaultOAuthButtonTextResolver
): TOAuthConfigs => {
  const coreOAuthConfig = useCoreOAuthConfig(getOAuthButtonText);
  const extendedOAuthConfig = useExtendedOAuthConfig(getOAuthButtonText);
  return {
    isOAuthEnabled: coreOAuthConfig.isOAuthEnabled || extendedOAuthConfig.isOAuthEnabled,
    oAuthOptions: [...coreOAuthConfig.oAuthOptions, ...extendedOAuthConfig.oAuthOptions],
  };
};
