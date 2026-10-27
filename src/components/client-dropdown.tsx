import type { JSX } from "solid-js"
import { splitProps } from "solid-js"

import type * as DropdownMenuPrimitive from "@kobalte/core/dropdown-menu"
import { invoke } from "@tauri-apps/api/core"
import { exit } from "@tauri-apps/plugin-process"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const SignOutIcon: JSX.Element = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="size-4 shrink-0"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

const PowerIcon: JSX.Element = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="size-4 shrink-0"
  >
    <path d="M12 2v10" />
    <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
  </svg>
)

type ClientDropdownProps = Omit<
  DropdownMenuPrimitive.DropdownMenuContentProps<"div">,
  "children"
> & {
  children?: JSX.Element
}

export function ClientDropdown(
  props: ClientDropdownProps & { class?: string }
) {
  const [local, others] = splitProps(props, ["children", "class"])

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger class={local.class}>
          {local.children}
        </DropdownMenuTrigger>
        <DropdownMenuContent {...others}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Client</DropdownMenuLabel>
            <DropdownMenuItem variant="destructive" onSelect={() => exit()}>
              {SignOutIcon} Exit
            </DropdownMenuItem>
            <AlertDialogTrigger as={DropdownMenuItem} variant="destructive">
              {PowerIcon} Shut down
            </AlertDialogTrigger>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Shut down client?</AlertDialogTitle>
          <AlertDialogDescription>
            This will shut down the client and end your session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => invoke("shutdown")}>
            Shut down
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
