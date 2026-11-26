import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { BookHeart, Lock, PenLine, Trash2, ImagePlus, X, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/diario")({
  head: () => pageHead("Meu Diário", "Seu espaço de desabafo e registros pessoais no Código Violeta."),
  component: Diario,
});

interface DiaryEntry {
  id: string;
  date: string;
  text: string;
  images?: string[];
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

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Selecione apenas imagens.");
  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Imagem inválida.")); };
    img.src = url;
  });
  const scale = Math.min(1, 1200 / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível processar a imagem.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.68);
}

function Diario() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const handleImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setImageError("");
    setSaved(false);
    try {
      const selected = Array.from(files).slice(0, 3 - images.length);
      if (files.length > selected.length) setImageError("É possível anexar até 3 fotos por desabafo.");
      const compressed = await Promise.all(selected.map(compressImage));
      setImages((current) => [...current, ...compressed].slice(0, 3));
    } catch {
      setImageError("Não foi possível anexar a foto. Tente outra imagem.");
    }
  };

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      text: trimmed,
      images,
    };
    const next = [entry, ...entries];
    try {
      saveEntries(next);
      setEntries(next);
      setText("");
      setImages([]);
      setSaved(true);
      setImageError("");
    } catch {
      setImageError("O armazenamento do aparelho está cheio. Remova fotos antigas e tente novamente.");
    }
  };

  const handleDelete = (id: string) => {
    const next = entries.filter((entry) => entry.id !== id);
    saveEntries(next);
    setEntries(next);
  };

  return (
    <PhoneShell title="Meu Diário" showBack>
      <div className="text-center mt-1">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary-soft flex items-center justify-center">
          <BookHeart className="text-primary" size={28} />
        </div>
        <h2 className="text-lg font-bold text-foreground mt-3">Espaço de desabafo</h2>
        <p className="text-sm text-muted-foreground mt-1">Escreva livremente o que está sentindo e, se quiser, anexe fotos. Este espaço é só seu.</p>
      </div>

      <div className="mt-5 bg-card border border-border rounded-xl p-4 shadow-sm">
        <label htmlFor="desabafo" className="text-sm font-semibold text-foreground flex items-center gap-2">
          <PenLine size={16} className="text-primary" /> Como foi o seu dia?
        </label>
        <textarea id="desabafo" value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }}
          placeholder="Desabafe aqui... conte o que aconteceu, como você se sente, o que quiser."
          rows={5} className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          aria-label="Selecionar fotos para anexar" onChange={(e) => { void handleImages(e.target.files); e.currentTarget.value = ""; }} />
        <button type="button" onClick={() => fileRef.current?.click()}
          disabled={images.length >= 3}
          className="mt-3 w-full rounded-lg border border-primary/30 text-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          <ImagePlus size={18} /> Anexar fotos ({images.length}/3)
        </button>
        {imageError && <p role="alert" className="mt-2 text-xs text-destructive">{imageError}</p>}
        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img src={image} alt={`Foto anexada ${index + 1}`} className="h-24 w-full rounded-lg object-cover" />
                <button type="button" onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                  aria-label="Remover foto" className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
        {saved && <p role="status" className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold text-green-700"><CheckCircle2 size={18} /> Desabafo salvo com sucesso!</p>}
        <button onClick={handleSave} disabled={!text.trim() && images.length === 0}
          className="mt-3 w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform">
          Guardar desabafo
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Meus registros</h3>
        {entries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-4">Nenhum desabafo registrado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id} className="bg-card border border-border rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">{entry.date}</p>
                  <button onClick={() => handleDelete(entry.id)} aria-label="Excluir desabafo"
                    className="p-1 text-muted-foreground hover:text-sos transition-colors"><Trash2 size={16} /></button>
                </div>
                {entry.text && <p className="text-sm text-foreground mt-1 whitespace-pre-line leading-relaxed">{entry.text}</p>}
                {!!entry.images?.length && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {entry.images.map((image, index) => (
                      <button key={index} type="button" onClick={() => setPreview(image)} aria-label={`Visualizar foto ${index + 1}`}>
                        <img src={image} alt={`Foto do desabafo ${index + 1}`} className="h-24 w-full rounded-lg object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {preview && (
        <div role="dialog" aria-modal="true" aria-label="Visualização da foto"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <button type="button" aria-label="Fechar foto" className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white"><X size={24} /></button>
          <img src={preview} alt="Foto ampliada do diário" className="max-h-[85vh] max-w-full object-contain" />
        </div>
      )}

      <div className="mt-6 bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <Lock className="text-primary shrink-0" size={22} />
        <p className="text-xs text-foreground/80">Seus desabafos e fotos ficam salvos neste aparelho e podem ser vistos por quem tiver acesso a ele.</p>
      </div>
    </PhoneShell>
  );
}
