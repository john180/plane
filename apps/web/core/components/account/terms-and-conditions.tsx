/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { EAuthModes, WEBSITE_URL } from "@plane/constants";
import { useTranslation } from "@plane/i18n";

interface TermsAndConditionsProps {
  authType?: EAuthModes;
}

const TERM_PREFIX_KEYS = {
  [EAuthModes.SIGN_UP]: "auth.terms.sign_up_prefix",
  [EAuthModes.SIGN_IN]: "auth.terms.sign_in_prefix",
} as const;

// Reusable link component to reduce duplication
function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-secondary" target="_blank" rel="noopener noreferrer">
      <span className="text-13 font-medium underline hover:cursor-pointer">{children}</span>
    </a>
  );
}

export function TermsAndConditions({ authType = EAuthModes.SIGN_IN }: TermsAndConditionsProps) {
  const { t } = useTranslation();
  if (!WEBSITE_URL) return null;

  const legalUrl = WEBSITE_URL.replace(/\/$/, "");

  return (
    <div className="flex items-center justify-center">
      <p className="text-center text-13 whitespace-pre-line text-tertiary">
        {`${t(TERM_PREFIX_KEYS[authType])}\n`}
        <LegalLink href={`${legalUrl}/legals/terms-and-conditions`}>{t("auth.terms.terms_of_service")}</LegalLink>
        {t("auth.terms.and")}
        <LegalLink href={`${legalUrl}/legals/privacy-policy`}>{t("auth.terms.privacy_policy")}</LegalLink>
        {t("auth.terms.end")}
      </p>
    </div>
  );
}
