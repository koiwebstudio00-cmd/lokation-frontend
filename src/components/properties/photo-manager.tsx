"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePhoto, reorderPhotos, setPortada } from "@/actions/images";
import { uploadPropertyPhotos } from "@/lib/upload-photos";
import { imageUrl } from "@/lib/utils";
import type { PropertyImage } from "@/lib/types";

const MAX_FOTOS = 20;

export function PhotoManager({
  propertyId,
  images,
}: {
  propertyId: string;
  images: PropertyImage[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const orderedImages = [...images].sort((a, b) => a.orden - b.orden);
  const draggedId = useRef<string | null>(null);

  async function moveImage(from: number, to: number) {
    if (
      savingOrder || uploading || busyId || from === to ||
      from < 0 || to < 0 || to >= orderedImages.length
    ) return;
    const next = [...orderedImages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSavingOrder(true);
    const error = await reorderPhotos(propertyId, next.map((image) => image.id));
    setSavingOrder(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Orden de fotos actualizado");
      router.refresh();
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const remaining = MAX_FOTOS - orderedImages.length;
    if (remaining <= 0) {
      toast.error(`Máximo ${MAX_FOTOS} fotos por propiedad.`);
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length < files.length) {
      toast.warning(`Solo se suben ${selected.length} (límite de ${MAX_FOTOS}).`);
    }

    setUploading(true);
    const { ok, failed, error } = await uploadPropertyPhotos(propertyId, selected);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (error) toast.error(error);
    else if (failed > 0) {
      toast.warning(`${failed} foto(s) no se pudieron subir. Probá de nuevo.`);
    }
    if (ok > 0) {
      toast.success(ok === 1 ? "Foto subida" : `${ok} fotos subidas`);
      router.refresh();
    }
  }

  async function handlePortada(image: PropertyImage) {
    setBusyId(image.id);
    const error = await setPortada(image.id, propertyId);
    setBusyId(null);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Portada actualizada");
      router.refresh();
    }
  }

  // La API borra el objeto en R2 y promueve la siguiente portada si hacía falta.
  async function handleDelete(image: PropertyImage) {
    setBusyId(image.id);
    const error = await deletePhoto(image.id, propertyId);
    setBusyId(null);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Foto eliminada");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Fotos{" "}
          <span className="text-sm font-normal text-muted-foreground">
            {orderedImages.length}/{MAX_FOTOS}
          </span>
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || savingOrder || busyId !== null || orderedImages.length >= MAX_FOTOS}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {uploading ? "Subiendo..." : "Agregar fotos"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {orderedImages.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Sin fotos todavía. La primera que subas queda como portada.
        </p>
      ) : (
        <>
          {orderedImages.length > 1 && (
            <p className="text-sm text-muted-foreground">
              Arrastrá una foto para ordenarla o usá las flechas. La portada se elige por separado.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {orderedImages.map((img, index) => (
              <div
              key={img.id}
              className="group relative aspect-[4/3] rounded-xl border bg-muted"
              draggable={orderedImages.length > 1 && !savingOrder && !uploading && busyId === null}
              onDragStart={(event) => {
                draggedId.current = img.id;
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", img.id);
              }}
              onDragOver={(event) => {
                if (draggedId.current && draggedId.current !== img.id) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const from = orderedImages.findIndex((image) => image.id === draggedId.current);
                draggedId.current = null;
                void moveImage(from, index);
              }}
              onDragEnd={() => {
                draggedId.current = null;
              }}
            >
              <Image
                src={imageUrl(img.url)}
                alt="Foto de la propiedad"
                fill
                draggable={false}
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
              {orderedImages.length > 1 && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-xs text-foreground">
                  <GripVertical className="size-3" aria-hidden="true" />
                  {index + 1}
                </span>
              )}
              {img.es_portada && (
                <span className="absolute right-1 top-1 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                  Portada
                </span>
              )}
              <div className="absolute bottom-1 right-1 flex gap-1">
                {orderedImages.length > 1 && (
                  <>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="size-8"
                      disabled={index === 0 || savingOrder || uploading || busyId !== null}
                      onClick={() => void moveImage(index, index - 1)}
                      aria-label={`Mover foto ${index + 1} antes`}
                    >
                      <ArrowLeft />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="size-8"
                      disabled={index === orderedImages.length - 1 || savingOrder || uploading || busyId !== null}
                      onClick={() => void moveImage(index, index + 1)}
                      aria-label={`Mover foto ${index + 1} después`}
                    >
                      <ArrowRight />
                    </Button>
                  </>
                )}
                {!img.es_portada && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="size-8"
                    disabled={busyId !== null || savingOrder || uploading}
                    onClick={() => handlePortada(img)}
                    aria-label="Marcar como portada"
                  >
                    <Star />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-8"
                  disabled={busyId !== null || savingOrder || uploading}
                  onClick={() => handleDelete(img)}
                  aria-label="Eliminar foto"
                >
                  <Trash2 />
                </Button>
              </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
