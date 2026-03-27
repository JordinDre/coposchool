// resources/js/components/flash-toaster.tsx
import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";

type Flash = { success?: string; error?: string; info?: string; warning?: string };
type Shared = { 
  flash?: Flash;
  errors?: Record<string, string>;
};

export default function FlashToaster() {
  const { flash, errors } = usePage<Shared>().props;
  const { success, error, info, warning } = flash ?? {}; // ← desestructuramos fuera

  useEffect(() => {
    if (success) toast.success(success, { duration: 5000 });
    if (error)   toast.error(error, { duration: 7000 });
    if (info)    toast.message(info, { duration: 5000 });
    if (warning) toast.warning(warning, { duration: 6000 });
  }, [success, error, info, warning]); // ← sin 'flash' en deps

  // Mostrar errores de validación como notificaciones
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      // Agrupar errores por tipo para mejor organización
      const fieldErrors = Object.entries(errors).filter(([key]) => key.includes('.'));
      const generalErrors = Object.entries(errors).filter(([key]) => !key.includes('.'));

      // Mostrar errores de campos específicos (ej: detalles.0.cantidad, pagos.0.total, etc.)
      if (fieldErrors.length > 0) {
        // Agrupar por el primer nivel del campo (ej: detalles, pagos, etc.)
        const groupedErrors = fieldErrors.reduce((acc, [key, message]) => {
          const fieldGroup = key.split('.')[0];
          if (!acc[fieldGroup]) {
            acc[fieldGroup] = [];
          }
          acc[fieldGroup].push(message);
          return acc;
        }, {} as Record<string, string[]>);

        // Mostrar cada grupo de errores
        Object.entries(groupedErrors).forEach(([fieldGroup, messages]) => {
          const uniqueMessages = [...new Set(messages)]; // Eliminar duplicados
          toast.error(`Error en ${fieldGroup}: ${uniqueMessages.join(', ')}`, { 
            duration: 8000,
            description: "Verifica los datos ingresados"
          });
        });
      }

      // Mostrar errores generales (sin puntos en la clave), excluyendo lock_conflict
      // (lock_conflict se maneja en el onError de cada formulario para evitar toast doble)
      const nonLockErrors = generalErrors.filter(([key]) => key !== 'lock_conflict');
      if (nonLockErrors.length > 0) {
        const generalMessages = nonLockErrors.map(([, message]) => message);
        const uniqueMessages = [...new Set(generalMessages)]; // Eliminar duplicados
        toast.error(`Error: ${uniqueMessages.join(', ')}`, {
          duration: 8000
        });
      }
    }
  }, [errors]);

  return null;
}