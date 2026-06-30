/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { EAuthModes } from "@plane/constants";
import { useTranslation } from "@plane/i18n";

interface TermsAndConditionsProps {
  authType?: EAuthModes;
}

// Constants for better maintainability
const LEGAL_LINKS = {
  termsOfService: "https://plane.so/legals/terms-and-conditions",
  privacyPolicy: "https://plane.so/legals/privacy-policy",
} as const;

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

  return (
    <div className="flex items-center justify-center">
      <p className="text-center text-13 whitespace-pre-line text-tertiary">
        {`${t(TERM_PREFIX_KEYS[authType])}\n`}
        <LegalLink href={LEGAL_LINKS.termsOfService}>{t("auth.terms.terms_of_service")}</LegalLink>
        {t("auth.terms.and")}
        <LegalLink href={LEGAL_LINKS.privacyPolicy}>{t("auth.terms.privacy_policy")}</LegalLink>
        {t("auth.terms.end")}
      </p>
    </div>
  );
}
