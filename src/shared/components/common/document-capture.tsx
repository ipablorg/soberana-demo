import { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Camera, FileText, Loader2, RefreshCw } from '@/shared/components/animated-icons';
import { useLingui } from '@lingui/react/macro';
import { compressImageToBase64 } from '@/shared/lib/image-compression';
import { checkFile, readFileAsDataUrl } from '@/shared/lib/file-data-url';

/** Name and type of a file kept as is (file mode). */
export interface CapturedFileMeta {
  fileName: string;
  mimeType: string;
}

interface DocumentCaptureProps {
  /** Visible label, e.g. "Front of document". */
  label: string;
  /** Base64 data URL (`data:image/jpeg;base64,…`), or undefined when empty. */
  value?: string;
  /** Receives the base64 data URL, or undefined when cleared. */
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  /**
   * File mode: the accepted MIME types (e.g. PDF, PNG, JPEG). The file is kept
   * as is — no camera hint, no JPEG re-encoding. Omitted: camera/photo capture
   * compressed to JPEG (the KYC wizard).
   */
  accept?: readonly string[];
  /** File mode: largest accepted file, in bytes. */
  maxBytes?: number;
  /** File mode: the kept file's name, shown instead of a preview for non-images. */
  fileName?: string;
  /** File mode: receives the kept file's name and type, or undefined when cleared. */
  onFileMeta?: (meta: CapturedFileMeta | undefined) => void;
}

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

/**
 * Reusable camera/upload capture for a single document side.
 *
 * Pipeline: file (camera on mobile via `capture`) → compress to bounded JPEG
 * (image-compression) → base64 data URL stored in the form. In file mode
 * (`accept`), the file is checked against the types and size and kept as a
 * data URL without re-encoding.
 *
 * SECURITY (NFR-001): image bytes live only in React state here; they are never
 * logged, never written to localStorage/IndexedDB, and never sent to console.
 *
 * The backend `customers_create` contract expects the full data URL
 * (`data:image/[type];base64,…`) for `image_front`/`image_back`, so the prefix
 * is preserved end-to-end.
 */
export function DocumentCapture({
  label,
  value,
  onChange,
  disabled,
  accept,
  maxBytes = DEFAULT_MAX_BYTES,
  fileName,
  onFileMeta,
}: DocumentCaptureProps) {
  const { t } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFileMode = Boolean(accept && accept.length > 0);

  // Preview is the stored data URL (always JPEG from compression).
  const previewSrc = value ?? null;
  const isImagePreview = previewSrc?.startsWith('data:image/') ?? false;

  const keepFile = async (file: File) => {
    const problem = checkFile(file, accept ?? [], maxBytes);
    if (problem === 'type') {
      setError(t`Formato no admitido. Sube un archivo PDF, PNG o JPEG.`);
      return;
    }
    if (problem === 'size') {
      const megabytes = Math.round(maxBytes / (1024 * 1024));
      setError(t`El archivo supera el máximo de ${megabytes} MB.`);
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    onChange(dataUrl);
    onFileMeta?.({ fileName: file.name, mimeType: file.type });
  };

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the input so selecting the same file again re-triggers change.
    event.target.value = '';
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    try {
      if (isFileMode) {
        await keepFile(file);
      } else {
        const dataUrl = await compressImageToBase64(file);
        onChange(dataUrl);
      }
    } catch {
      setError(t`We could not process that image. Please try another one.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openPicker = () => inputRef.current?.click();
  const clear = () => {
    setError(null);
    onChange(undefined);
    onFileMeta?.(undefined);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>

      <input
        ref={inputRef}
        type="file"
        accept={isFileMode ? accept!.join(',') : 'image/*'}
        capture={isFileMode ? undefined : 'environment'}
        className="sr-only"
        aria-label={label}
        onChange={handleSelect}
        disabled={disabled || isProcessing}
      />

      {previewSrc ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
          {isImagePreview ? (
            <img src={previewSrc} alt={label} className="max-h-44 w-full object-contain" />
          ) : (
            <div className="flex min-h-16 items-center gap-2 p-3 pr-28 text-sm text-foreground">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="break-all">{fileName ?? label}</span>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={disabled || isProcessing}
            className="absolute right-2 top-2 h-8 gap-1.5 bg-background/80 backdrop-blur-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {isFileMode ? t`Cambiar archivo` : t`Retake`}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={openPicker}
          disabled={disabled || isProcessing}
          className="h-24 w-full flex-col gap-1.5 border-dashed"
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isFileMode ? (
            <FileText className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Camera className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {isProcessing
              ? t`Processing…`
              : isFileMode
                ? t`Subir archivo (PDF, PNG o JPEG)`
                : t`Take photo or upload`}
          </span>
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function DocumentUploadCapture({ label, value, onChange, disabled }: DocumentCaptureProps) {
  return <DocumentCapture label={label} value={value} onChange={onChange} disabled={disabled} />;
}
