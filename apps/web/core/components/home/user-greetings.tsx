/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane types
import { useTranslation } from "@plane/i18n";
import type { IUser } from "@plane/types";
// plane ui
// hooks
import { useCurrentTime } from "@/hooks/use-current-time";

export interface IUserGreetingsView {
  user: IUser;
}

export function UserGreetingsView(props: IUserGreetingsView) {
  const { user } = props;
  // current time hook
  const { currentTime } = useCurrentTime();
  // store hooks
  const { currentLocale, t } = useTranslation();
  const locale = currentLocale === "zh-CN" ? "zh-CN" : "en-US";
  const timeZone = user?.user_timezone || undefined;

  const hour = new Intl.DateTimeFormat("en-US", {
    hour12: false,
    hour: "numeric",
    timeZone,
  }).format(currentTime);

  const dateTimeString = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour12: false, // Use 24-hour format
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(currentTime);

  const greeting = parseInt(hour, 10) < 12 ? "morning" : parseInt(hour, 10) < 18 ? "afternoon" : "evening";
  const greetingKey = `good_${greeting}_with_name`;
  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");

  return (
    <div className="my-6 flex flex-col items-center">
      <h2 className="text-center text-20 font-semibold">{t(greetingKey, { name: userName })}</h2>
      <h5 className="flex items-center gap-2 font-medium text-placeholder">
        <div>{greeting === "morning" ? "🌤️" : greeting === "afternoon" ? "🌥️" : "🌙️"}</div>
        <div>{dateTimeString}</div>
      </h5>
    </div>
  );
}
