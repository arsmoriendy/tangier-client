import { Button } from "@/components/ui/button"
import { invoke } from "@tauri-apps/api/core"
import { createEffect, createSignal, onMount, Show } from "solid-js"
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "./components/ui/text-field"
import { Progress } from "./components/ui/progress"
import { createStore } from "solid-js/store"
import { Label } from "./components/ui/label"
import { productName } from "src-tauri/tauri.conf.json"

export function Root() {
  const [url, setUrl] = createSignal<string | null>(null)
  const [shouldRedirect, setShouldRedirect] = createSignal(false)
  const [countdown, setCountdown] = createStore({
    durationMs: 5000,
    elapsedMs: 0,
    pollMs: 100,
    intervalId: 0,
  })

  function incrementCountdown() {
    setCountdown("elapsedMs", (ellapsedMs) => ellapsedMs + countdown.pollMs)
  }

  function startCountdown() {
    setCountdown(
      "intervalId",
      setInterval(incrementCountdown, countdown.pollMs)
    )
  }

  function resetCountdown() {
    setCountdown("elapsedMs", 0)
  }

  function cleanUpCountdownInterval() {
    clearInterval(countdown.intervalId)
  }

  function cancelCountdown() {
    cleanUpCountdownInterval()
    resetCountdown()
  }

  function redirect() {
    if (url() !== null) window.location.href = url()!
  }

  // init url
  onMount(async () => {
    const url = await invoke<string | null>("read_url")
    setUrl(url)
  })

  // handle url update
  createEffect(async () => {
    await invoke("update_url", { url: url() })
    setShouldRedirect(url() !== null)
  })

  // countdown starter
  createEffect(() => {
    if (shouldRedirect()) startCountdown()
  })

  // handle countdown finish
  createEffect(() => {
    if (countdown.durationMs === countdown.elapsedMs) {
      cleanUpCountdownInterval()
      if (shouldRedirect()) redirect()
    }
  })

  return (
    <form
      class="min-w-sm space-y-2"
      on:submit={(e) => {
        e.preventDefault()

        const data = new FormData(e.currentTarget)
        const newUrl = data.get("url") as string | undefined

        setUrl(newUrl ?? null)
        setShouldRedirect(true)
      }}
    >
      <TextField>
        <TextFieldLabel>{productName} URL</TextFieldLabel>
        <TextFieldInput
          name="url"
          placeholder="E.g., http://192.168.x.x"
          value={url() ?? undefined}
          disabled={shouldRedirect()}
        />
      </TextField>
      <Button size="sm" type="submit">
        Save and redirect
      </Button>

      <Show when={shouldRedirect()}>
        <br />
        <Label>
          Redirecting in{" "}
          {((countdown.durationMs - countdown.elapsedMs) / 1000).toFixed(2)}s
        </Label>
        <Progress value={(countdown.elapsedMs / countdown.durationMs) * 100} />
        <div class="flex gap-2">
          <Button
            size="sm"
            type="button"
            on:click={() => {
              cancelCountdown()
              redirect()
            }}
          >
            Redirect now
          </Button>
          <Button
            size="sm"
            type="button"
            variant="destructive"
            on:click={() => {
              cancelCountdown()
              setShouldRedirect(false)
            }}
          >
            Cancel
          </Button>
        </div>
      </Show>
    </form>
  )
}
