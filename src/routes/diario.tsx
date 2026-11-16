import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { BookHeart, Lock, PenLine, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/diario")({
  head: () => pageHead("Meu Diário", "Seu espaço de desabafo e registros pessoais no Código Violeta."),
  component: Diario,
});

interface DiaryEntry {
  id: string;
  date: string;
  text: string;
}

const STORAGE_KEY = "cv:diario";

function getEntries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DiaryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: DiaryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function Diario() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: trimmed,
    };
    const next = [entry, ...entries];
    saveEntries(next);
    setEntries(next);
    setText("");
  };

  const handleDelete = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    saveEntries(next);
    setEntries(next);
  };

  return (
    <PhoneShell title="Meu Diário" showBack>
      <div className="text-center mt-1">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary-soft flex items-center justify-center">
          <BookHeart className="text-primary" size={28} />
        </div>
        <h2 className="text-lg font-bold text-foreground mt-3">
          Espaço de desabafo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Escreva livremente o que está sentindo. Este espaço é só seu.
        </p>
      </div>

      <div className="mt-5 bg-card border border-border rounded-xl p-4 shadow-sm">
        <label
          htmlFor="desabafo"
          className="text-sm font-semibold text-foreground flex items-center gap-2"
        >
          <PenLine size={16} className="text-primary" />
          Como foi o seu dia?
        </label>
        <textarea
          id="desabafo"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Desabafe aqui... conte o que aconteceu, como você se sente, o que quiser."
          rows={5}
          className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="mt-3 w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          Guardar desabafo
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Meus registros
        </h3>
        {entries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Nenhum desabafo registrado ainda.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="bg-card border border-border rounded-xl p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">
                    {entry.date}
                  </p>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    aria-label="Excluir desabafo"
                    className="p-1 text-muted-foreground hover:text-sos transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-foreground mt-1 whitespace-pre-line leading-relaxed">
                  {entry.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <Lock className="text-primary shrink-0" size={22} />
        <p className="text-xs text-foreground/80">
          Seus desabafos ficam salvos apenas neste aparelho e ninguém mais tem
          acesso a eles.
        </p>
      </div>
    </PhoneShell>
  );
}
