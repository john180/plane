/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useReducer, useRef } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachInstruction, extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Pin, PinOff } from "lucide-react";
// plane imports
import type { IWorkspaceSidebarNavigationItem } from "@plane/constants";
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Tooltip } from "@plane/propel/tooltip";
import { DragHandle, DropIndicator } from "@plane/ui";
import { cn } from "@plane/utils";
// components
import { SidebarNavItem } from "@/components/sidebar/sidebar-navigation";
// hooks
import { useAppTheme } from "@/hooks/store/use-app-theme";
import { useUser, useUserPermissions } from "@/hooks/store/user";
import { useWorkspaceNavigationPreferences } from "@/hooks/use-navigation-preferences";
import { getSidebarNavigationItemIcon } from "./helper";

type TExtendedSidebarItemProps = {
  item: IWorkspaceSidebarNavigationItem;
  handleOnNavigationItemDrop?: (
    sourceId: string | undefined,
    destinationId: string | undefined,
    shouldDropAtEnd: boolean
  ) => void;
  disableDrag?: boolean;
  disableDrop?: boolean;
  isLastChild: boolean;
};

type TDragInstruction = "DRAG_OVER" | "DRAG_BELOW";

type TDragState = {
  isDragging: boolean;
  instruction: TDragInstruction | undefined;
};

type TDragAction =
  | { type: "SET_DRAGGING"; isDragging: boolean }
  | { type: "SET_INSTRUCTION"; instruction: TDragInstruction | undefined };

const INITIAL_DRAG_STATE: TDragState = {
  isDragging: false,
  instruction: undefined,
};

const dragStateReducer = (state: TDragState, action: TDragAction): TDragState => {
  switch (action.type) {
    case "SET_DRAGGING":
      return { ...state, isDragging: action.isDragging };
    case "SET_INSTRUCTION":
      return { ...state, instruction: action.instruction };
  }
};

export const ExtendedSidebarItem = observer(function ExtendedSidebarItem(props: TExtendedSidebarItemProps) {
  const { item, handleOnNavigationItemDrop, disableDrag = false, disableDrop = false, isLastChild } = props;
  const { t } = useTranslation();
  // states
  const [{ isDragging, instruction }, dispatchDragState] = useReducer(dragStateReducer, INITIAL_DRAG_STATE);
  // refs
  const navigationIemRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLButtonElement | null>(null);

  // nextjs hooks
  const pathname = usePathname();
  const { workspaceSlug } = useParams();
  // store hooks
  const { toggleExtendedSidebar } = useAppTheme();
  const { data: userData } = useUser();
  const { allowPermissions } = useUserPermissions();
  const { preferences: workspacePreferences, toggleWorkspaceItem } = useWorkspaceNavigationPreferences();

  // derived values
  const isPinned = workspacePreferences.items[item.key]?.is_pinned ?? false;

  const handleLinkClick = () => toggleExtendedSidebar(true);

  useEffect(() => {
    const navigationItemElement = navigationIemRef.current;
    const dragHandleElement = dragHandleRef.current;

    if (!navigationItemElement) return;

    return combine(
      draggable({
        element: navigationItemElement,
        canDrag: () => !disableDrag,
        dragHandle: dragHandleElement ?? undefined,
        getInitialData: () => ({ id: item.key, dragInstanceId: "NAVIGATION" }), // var1
        onDragStart: () => {
          dispatchDragState({ type: "SET_DRAGGING", isDragging: true });
        },
        onDrop: () => {
          dispatchDragState({ type: "SET_DRAGGING", isDragging: false });
        },
      }),
      dropTargetForElements({
        element: navigationItemElement,
        canDrop: ({ source }) =>
          !disableDrop && source?.data?.id !== item.key && source?.data?.dragInstanceId === "NAVIGATION",
        getData: ({ input, element: dropTargetElement }) => {
          const dropTargetData = { id: item.key };

          // attach instruction for last in list
          return attachInstruction(dropTargetData, {
            input,
            element: dropTargetElement,
            currentLevel: 0,
            indentPerLevel: 0,
            mode: isLastChild ? "last-in-group" : "standard",
          });
        },
        onDrag: ({ self }) => {
          const extractedInstruction = extractInstruction(self?.data)?.type;
          // check if the highlight is to be shown above or below
          dispatchDragState({
            type: "SET_INSTRUCTION",
            instruction: extractedInstruction
              ? extractedInstruction === "reorder-below" && isLastChild
                ? "DRAG_BELOW"
                : "DRAG_OVER"
              : undefined,
          });
        },
        onDragLeave: () => {
          dispatchDragState({ type: "SET_INSTRUCTION", instruction: undefined });
        },
        onDrop: ({ self, source }) => {
          dispatchDragState({ type: "SET_INSTRUCTION", instruction: undefined });
          const extractedInstruction = extractInstruction(self?.data)?.type;
          const currentInstruction = extractedInstruction
            ? extractedInstruction === "reorder-below" && isLastChild
              ? "DRAG_BELOW"
              : "DRAG_OVER"
            : undefined;
          if (!currentInstruction) return;

          const sourceId = source?.data?.id as string | undefined;
          const destinationId = self?.data?.id as string | undefined;

          if (handleOnNavigationItemDrop)
            handleOnNavigationItemDrop(sourceId, destinationId, currentInstruction === "DRAG_BELOW");
        },
      })
    );
  }, [isLastChild, handleOnNavigationItemDrop, disableDrag, disableDrop, item.key]);

  const itemHref =
    item.key === "your_work"
      ? `/${workspaceSlug.toString()}${item.href}${userData?.id}`
      : `/${workspaceSlug.toString()}${item.href}`;
  const isActive = itemHref === pathname;

  const pinNavigationItem = (key: string) => {
    toggleWorkspaceItem(key, true);
  };

  const unPinNavigationItem = (key: string) => {
    toggleWorkspaceItem(key, false);
  };

  const icon = getSidebarNavigationItemIcon(item.key);

  if (!allowPermissions(item.access as any, EUserPermissionsLevel.WORKSPACE, workspaceSlug.toString())) {
    return null;
  }

  return (
    <div
      id={`sidebar-${item.key}`}
      className={cn("relative", {
        "bg-layer-1 opacity-60": isDragging,
      })}
      ref={navigationIemRef}
    >
      <DropIndicator classNames="absolute top-0" isVisible={instruction === "DRAG_OVER"} />
      <div
        className={cn(
          "group/project-item relative flex w-full items-center rounded-md text-primary hover:bg-surface-2"
        )}
        id={`${item.key}`}
      >
        {!disableDrag && (
          <Tooltip
            // isMobile={isMobile}
            tooltipContent={t("drag_to_rearrange")}
            position="top-start"
            disabled={isDragging}
          >
            <button
              type="button"
              className={cn(
                "absolute top-1/2 -left-3 flex -translate-y-1/2 cursor-grab items-center justify-center rounded text-placeholder opacity-0 group-hover/project-item:opacity-100",
                {
                  "cursor-grabbing": isDragging,
                  "opacity-100": isDragging,
                }
              )}
              ref={dragHandleRef}
            >
              <DragHandle className="bg-transparent" />
            </button>
          </Tooltip>
        )}
        <SidebarNavItem isActive={isActive}>
          <Link href={itemHref} onClick={() => handleLinkClick()} className="group flex-grow">
            <div className="flex items-center gap-1.5 py-[1px]">
              {icon}
              <p className="text-13 leading-5 font-medium">{t(item.labelTranslationKey)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {isPinned ? (
              <Tooltip tooltipContent="Unpin">
                <PinOff
                  className="size-3.5 flex-shrink-0 text-placeholder outline-none hover:text-tertiary"
                  onClick={() => unPinNavigationItem(item.key)}
                />
              </Tooltip>
            ) : (
              <Tooltip tooltipContent="Pin">
                <Pin
                  className="size-3.5 flex-shrink-0 text-placeholder outline-none hover:text-tertiary"
                  onClick={() => pinNavigationItem(item.key)}
                />
              </Tooltip>
            )}
          </div>
        </SidebarNavItem>
      </div>
      {isLastChild && <DropIndicator isVisible={instruction === "DRAG_BELOW"} />}
    </div>
  );
});
