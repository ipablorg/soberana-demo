/**
 * Document Upload Zone - Step 3
 * 
 * Dynamic drag-and-drop document upload with conditional requirements.
 * Documents appear/disappear based on transaction parameters.
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowRight, ArrowLeft, UploadCloud, FileText, X, CheckCircle2 } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLingui } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

import { useComexStore } from '../../hooks/useComexStore';
import type { DocumentType } from '../../types/comex.types';

// ============================================
// SINGLE DOCUMENT UPLOAD ZONE
// ============================================

interface DocumentZoneProps {
    type: DocumentType;
    label: string;
    description: string;
    required: boolean;
    maxSizeMB: number;
    acceptedFormats: string[];
}

function DocumentZone({
    type,
    label,
    description,
    required,
    maxSizeMB,
    acceptedFormats,
}: DocumentZoneProps) {
    const { documents, addDocument, removeDocument } = useComexStore();
    const { t } = useLingui();
    const uploadedDoc = documents[type];

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            // Validate file size
            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                toast.error(t`El archivo excede el tamaño máximo de ${maxSizeMB}MB`);
                return;
            }

            if (!acceptedFormats.includes(file.type)) {
                toast.error(t`Ese formato de archivo no es compatible`);
                return;
            }

            addDocument(type, file);
            toast.success(t`${label} cargado`);
        },
        [type, label, maxSizeMB, acceptedFormats, addDocument]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFormats.reduce((acc, format) => ({ ...acc, [format]: [] }), {}),
        maxFiles: 1,
        multiple: false,
    });

    const handleRemove = () => {
        removeDocument(type);
        toast.info(t`${label} eliminado`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
        >
            {/* Label */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <p className="font-heading text-foreground">{label}</p>
                    {required && (
                        <Badge variant="destructive" className="text-xs">
                            Requerido
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">Max {maxSizeMB}MB</p>
            </div>

            {/* Upload Zone or Uploaded File */}
            {!uploadedDoc ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        'relative rounded-xl border-2 border-dashed p-6 transition-colors duration-150 cursor-pointer',
                        isDragActive
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="rounded-full bg-primary/10 p-3">
                            <UploadCloud className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra o haz clic para subir'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border-2 border-success/50 bg-success/10 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-success/20 p-2">
                                <FileText className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{uploadedDoc.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(uploadedDoc.file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleRemove}
                                className="h-8 w-8"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DocumentUploadZone() {
    const { requiredDocuments, documents, nextStep, prevStep } = useComexStore();
    const { t: tMain } = useLingui();

    // Check if all required documents are uploaded
    const allRequiredUploaded = requiredDocuments
        .filter((doc) => doc.required)
        .every((doc) => documents[doc.type] !== null);

    const handleContinue = () => {
        if (!allRequiredUploaded) {
            toast.error(tMain`Faltan documentos requeridos`);
            return;
        }
        nextStep();
    };

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="space-y-2">
                <h3 className="text-2xl font-heading text-foreground">Documentos Requeridos</h3>
                <p className="text-muted-foreground">
                    Los documentos se determinan automáticamente según el país de destino y monto de la
                    operación.
                </p>
            </div>

            {/* Document Zones (Animated) */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {requiredDocuments.map((doc) => (
                        <DocumentZone
                            key={doc.type}
                            type={doc.type}
                            label={doc.label}
                            description={doc.description}
                            required={doc.required}
                            maxSizeMB={doc.maxSizeMB}
                            acceptedFormats={doc.acceptedFormats}
                        />
                    ))}
                </AnimatePresence>

                {requiredDocuments.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                        <p className="text-muted-foreground">
                            No se requieren documentos adicionales para esta operación.
                        </p>
                    </div>
                )}
            </div>

            {/* Progress Indicator */}
            {requiredDocuments.length > 0 && (
                <div className="rounded-xl bg-muted/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-foreground">Progreso</p>
                        <p className="text-sm font-mono tabular-nums text-muted-foreground">
                            {Object.values(documents).filter((d) => d !== null).length} /{' '}
                            {requiredDocuments.filter((d) => d.required).length}
                        </p>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{
                                width: `${(Object.values(documents).filter((d) => d !== null).length /
                                        requiredDocuments.filter((d) => d.required).length) *
                                    100
                                    }%`,
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                </Button>
                <Button
                    type="button"
                    variant="gradient"
                    size="lg"
                    onClick={handleContinue}
                    disabled={!allRequiredUploaded}
                    className="gap-2"
                >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );
}
