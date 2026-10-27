import type { JSX } from "solid-js"
import { splitProps } from "solid-js"
import { LogOut, Power, X } from "lucide-solid"

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

const SignOutIcon: JSX.Element = <LogOut class="size-4 shrink-0" />

const PowerIcon: JSX.Element = <Power class="size-4 shrink-0" />

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
          <AlertDialogCancel>
            <X />
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => invoke("shutdown")}>
            <Power />
            Shut down
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
