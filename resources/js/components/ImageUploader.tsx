import { Label } from '@/components/ui/label';
import type { MediaImage } from '@/types';
import type { FilePondFile } from 'filepond';
import { AlertCircle, X } from 'lucide-react';
import React, { useId } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';

// Importar estilos de FilePond
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';

// Importar plugins
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

// Registrar plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface ImageUploaderProps {
    label?: string;
    maxImages?: number;
    maxSizeInMB?: number;
    acceptedFormats?: string[];
    images?: File[];
    existingImages?: MediaImage[];
    onImagesChange: (images: File[]) => void;
    onExistingImageRemove?: (imageId: number) => void;
    onValidationError?: (error: string | null) => void;
    disabled?: boolean;
    error?: string;
    showPrincipalBadge?: boolean;
    helperText?: string;
    allowReorder?: boolean;
}

export default function ImageUploader({
    label = 'Imágenes',
    maxImages = 5,
    maxSizeInMB = 2,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
    images = [],
    existingImages = [],
    onImagesChange,
    onExistingImageRemove,
    onValidationError,
    disabled = false,
    error,
    showPrincipalBadge = true,
    helperText,
    allowReorder = true,
}: ImageUploaderProps) {
    const inputId = useId();
    const totalImages = existingImages.length + images.length;
    const [files, setFiles] = React.useState<FilePondFile[]>([]);
    const [sizeError, setSizeError] = React.useState<string | null>(null);

    // Nota: initialFiles se puede usar en el futuro si necesitamos mostrar imágenes existentes en FilePond
    // const initialFiles: FilePondInitialFile[] = React.useMemo(
    //     () =>
    //         existingImages.map((img) => ({
    //             source: img.id.toString(),
    //             options: {
    //                 type: 'local',
    //                 file: {
    //                     name: img.name,
    //                     size: img.size,
    //                 },
    //                 metadata: {
    //                     poster: img.preview,
    //                 },
    //             },
    //         })),
    //     [existingImages],
    // );

    const handleUpdateFiles = (fileItems: FilePondFile[]) => {
        // Filtrar solo los archivos nuevos (no los existentes) y validar tamaño
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convertir MB a bytes
        const validFiles: File[] = [];
        const filesToRemove: FilePondFile[] = [];

        fileItems.forEach((item) => {
            if (item.file instanceof File) {
                if (item.file.size > maxSizeInBytes) {
                    // Marcar para eliminar archivos que exceden el tamaño
                    filesToRemove.push(item);
                } else {
                    validFiles.push(item.file);
                }
            }
        });

        // Remover archivos inválidos inmediatamente
        if (filesToRemove.length > 0) {
            filesToRemove.forEach((item) => {
                item.remove();
            });
            const fileNames = filesToRemove.map((item) => (item.file instanceof File ? item.file.name : '')).join(', ');
            const errorMessage = `Las siguientes imágenes exceden el tamaño máximo de ${maxSizeInMB}MB: ${fileNames}`;
            setSizeError(errorMessage);
            if (onValidationError) {
                onValidationError(errorMessage);
            }
        } else {
            setSizeError(null);
            if (onValidationError) {
                onValidationError(null);
            }
        }

        // Actualizar el estado de FilePond solo con archivos válidos
        const validFileItems = fileItems.filter((item) => !filesToRemove.includes(item));
        setFiles(validFileItems);

        // Solo pasar los archivos válidos al componente padre
        onImagesChange(validFiles);
    };

    const handleRemoveFile = (error: unknown, file: FilePondFile) => {
        // Si el archivo tiene un source numérico, es una imagen existente
        if (file.source && !isNaN(Number(file.source))) {
            const mediaId = Number(file.source);
            if (onExistingImageRemove) {
                onExistingImageRemove(mediaId);
            }
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={inputId} className="text-base">
                {label}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({totalImages}/{maxImages})
                </span>
            </Label>

            <div className="space-y-4">
                {/* Imágenes existentes con badges */}
                {existingImages.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-muted-foreground">Imágenes actuales:</p>
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                Guardadas
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                            {existingImages.map((img, index) => (
                                <div key={img.id} className="group relative duration-300 animate-in fade-in">
                                    <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 transition-all hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-500">
                                        <img src={img.preview} alt={img.name} className="h-32 w-full object-cover" />
                                        {showPrincipalBadge && index === 0 && (
                                            <div className="absolute top-2 left-2 rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white shadow-sm">
                                                Principal
                                            </div>
                                        )}
                                        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                                            <p className="truncate text-xs text-white">{formatFileSize(img.size)}</p>
                                        </div>
                                    </div>
                                    {onExistingImageRemove && (
                                        <button
                                            type="button"
                                            onClick={() => onExistingImageRemove(img.id)}
                                            disabled={disabled}
                                            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:scale-110 hover:bg-red-600 disabled:opacity-50"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FilePond para nuevas imágenes */}
                {existingImages.length > 0 && images.length > 0 && (
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Nuevas imágenes:</p>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                            Por guardar
                        </span>
                    </div>
                )}

                <div className={`filepond-wrapper ${error || sizeError ? 'has-error' : ''}`}>
                    <FilePond
                        files={files}
                        onupdatefiles={handleUpdateFiles}
                        onremovefile={handleRemoveFile}
                        onaddfile={(error, file) => {
                            if (error) {
                                // FilePond ya rechazó el archivo por validación nativa
                                return;
                            }
                            // Validación adicional: verificar tamaño antes de agregar
                            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
                            if (file.file instanceof File && file.file.size > maxSizeInBytes) {
                                // Rechazar el archivo inmediatamente con mensaje de error
                                const fileSizeMB = (file.file.size / (1024 * 1024)).toFixed(2);
                                file.setMetadata('error', `El archivo excede el tamaño máximo de ${maxSizeInMB}MB (${fileSizeMB}MB)`);
                                // Remover el archivo inmediatamente
                                setTimeout(() => {
                                    file.remove();
                                }, 0);
                                const errorMessage = `La imagen "${file.file.name}" excede el tamaño máximo de ${maxSizeInMB}MB (${fileSizeMB}MB).`;
                                setSizeError(errorMessage);
                                if (onValidationError) {
                                    onValidationError(errorMessage);
                                }
                            }
                        }}
                        onerror={(file, error) => {
                            // Mostrar error visual si el archivo tiene un error
                            if (file && error) {
                                console.error('Error en archivo:', file.filename, error);
                            }
                        }}
                        instantUpload={false}
                        allowMultiple={maxImages > 1}
                        maxFiles={maxImages - existingImages.length}
                        maxFileSize={`${maxSizeInMB}MB`}
                        acceptedFileTypes={acceptedFormats}
                        disabled={disabled}
                        allowReorder={allowReorder}
                        labelIdle='Arrastra y suelta tus imágenes o <span class="filepond--label-action">Examinar</span>'
                        labelFileProcessing="Procesando"
                        labelFileProcessingComplete="Procesado"
                        labelFileProcessingAborted="Cancelado"
                        labelFileProcessingError="Error al procesar"
                        labelTapToCancel="toca para cancelar"
                        labelTapToRetry="toca para reintentar"
                        labelTapToUndo="toca para deshacer"
                        labelButtonRemoveItem="Eliminar"
                        labelButtonAbortItemLoad="Abortar"
                        labelButtonRetryItemLoad="Reintentar"
                        labelButtonAbortItemProcessing="Cancelar"
                        labelButtonUndoItemProcessing="Deshacer"
                        labelButtonRetryItemProcessing="Reintentar"
                        labelButtonProcessItem="Subir"
                        labelMaxFileSizeExceeded={`El archivo excede el tamaño máximo de ${maxSizeInMB}MB`}
                        labelMaxFileSize={`Tamaño máximo: ${maxSizeInMB}MB`}
                        labelMaxTotalFileSizeExceeded="Tamaño total excedido"
                        labelMaxTotalFileSize={`Tamaño total máximo: ${maxSizeInMB * maxImages}MB`}
                        labelFileTypeNotAllowed="Tipo de archivo no válido"
                        fileValidateTypeLabelExpectedTypes="Formatos aceptados: {allTypes}"
                        credits={false}
                        stylePanelLayout="compact"
                        imagePreviewHeight={170}
                        className={error || sizeError ? 'filepond-error' : ''}
                    />
                </div>

                {/* Mensaje de ayuda */}
                {helperText ? (
                    <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/20">
                        <div className="flex gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                            <div className="text-xs text-blue-700 dark:text-blue-300">{helperText}</div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/20">
                        <div className="flex gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                <p className="font-medium">
                                    {showPrincipalBadge ? 'La primera imagen será la imagen principal.' : `Máximo ${maxImages} imágenes.`}
                                </p>
                                <p className="mt-1">
                                    Formatos: {acceptedFormats.map((f) => f.split('/')[1].toUpperCase()).join(', ')} (máx. {maxSizeInMB}MB c/u)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mensajes de error */}
                {(error || sizeError) && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {error || sizeError}
                    </p>
                )}
            </div>
        </div>
    );
}
