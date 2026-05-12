import { Prec, StateEffect, StateField, Transaction } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  keymap,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
  type EditorView as IEditorView,
} from "@codemirror/view";

const MAX_BODY_CHARS = 48_000;
const SUGGESTION_CAP = 240;

export const setInlineSuggestion = StateEffect.define<{ pos: number; text: string } | null>();

function clearOnDocChange(tr: Transaction): boolean {
  return tr.docChanged && !tr.isUserEvent("input.complete");
}

class GhostWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  eq(other: GhostWidget) {
    return other.text === this.text;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-ghost-suggestion";
    span.textContent = this.text;
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

const suggestionField = StateField.define<{ pos: number; text: string } | null>({
  create() {
    return null;
  },
  update(value, tr) {
    if (clearOnDocChange(tr)) return null;
    for (const e of tr.effects) {
      if (e.is(setInlineSuggestion)) return e.value;
    }
    return value;
  },
});

const suggestionDecorations = EditorView.decorations.compute([suggestionField], (state) => {
  const s = state.field(suggestionField);
  if (!s?.text) return Decoration.none;
  const deco = Decoration.widget({
    widget: new GhostWidget(s.text),
    side: 1,
  });
  return Decoration.set([deco.range(s.pos)]);
});

function acceptInlineSuggestion(view: IEditorView) {
  const s = view.state.field(suggestionField, false);
  if (!s?.text) return false;
  view.dispatch({
    changes: { from: s.pos, insert: s.text },
    effects: setInlineSuggestion.of(null),
    userEvent: "input.complete",
  });
  return true;
}

function rejectInlineSuggestion(view: IEditorView) {
  const s = view.state.field(suggestionField, false);
  if (!s) return false;
  view.dispatch({
    effects: setInlineSuggestion.of(null),
  });
  return true;
}

const suggestionKeymap = keymap.of([
  { key: "Tab", run: acceptInlineSuggestion },
  { key: "Escape", run: rejectInlineSuggestion },
]);

const suggestionTheme = Prec.high(
  EditorView.baseTheme({
    ".cm-ghost-suggestion": {
      opacity: "0.42",
      filter: "grayscale(0.15)",
      pointerEvents: "none",
      userSelect: "none",
    },
  }),
);

type InlineOpts = {
  projectId: string;
  filePath: string;
  debounceMs?: number;
};

function debouncePlugin(opts: InlineOpts) {
  const debounceMs = opts.debounceMs ?? 520;

  return ViewPlugin.fromClass(
    class {
      private timeout = 0;
      private seq = 0;
      private abort: AbortController | null = null;

      constructor(readonly view: IEditorView) {
        this.schedule(this.view);
      }

      update(u: ViewUpdate) {
        if (!u.docChanged) return;
        this.abort?.abort();
        this.schedule(u.view);
      }

      destroy() {
        window.clearTimeout(this.timeout);
        this.abort?.abort();
      }

      schedule(view: IEditorView) {
        window.clearTimeout(this.timeout);
        const cursorAtSchedule = view.state.selection.main.head;
        this.timeout = window.setTimeout(() => void this.run(view, cursorAtSchedule), debounceMs);
      }

      async run(view: IEditorView, cursorWhenScheduled: number) {
        const mySeq = ++this.seq;
        this.abort?.abort();
        this.abort = new AbortController();

        const head = view.state.selection.main.head;
        if (head !== cursorWhenScheduled) return;

        let code = view.state.doc.toString();
        if (code.length > MAX_BODY_CHARS) {
          code = code.slice(0, MAX_BODY_CHARS);
        }

        try {
          const res = await fetch(`/api/projects/${opts.projectId}/editor/suggest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              path: opts.filePath,
              code,
              cursor: Math.min(head, code.length),
            }),
            signal: this.abort.signal,
          });
          if (mySeq !== this.seq) return;
          if (!res.ok) {
            view.dispatch({ effects: setInlineSuggestion.of(null) });
            return;
          }
          const json = (await res.json()) as { suggestion?: string };
          const raw = (json.suggestion ?? "").trim();
          if (!raw) {
            view.dispatch({ effects: setInlineSuggestion.of(null) });
            return;
          }
          const text = raw.replace(/^[`]+|[`]+$/g, "").slice(0, SUGGESTION_CAP);
          if (mySeq !== this.seq) return;
          const now = view.state.selection.main.head;
          if (now !== cursorWhenScheduled) return;
          view.dispatch({
            effects: setInlineSuggestion.of({ pos: now, text }),
          });
        } catch {
          if (mySeq === this.seq) {
            view.dispatch({ effects: setInlineSuggestion.of(null) });
          }
        }
      }
    },
  );
}

/**
 * Inline ghost completion (Cursor-style): Tab accepts, Escape clears.
 */
export function buildInlineSuggestionExtensions(opts: InlineOpts) {
  return [suggestionField, suggestionDecorations, debouncePlugin(opts), suggestionKeymap, suggestionTheme];
}
