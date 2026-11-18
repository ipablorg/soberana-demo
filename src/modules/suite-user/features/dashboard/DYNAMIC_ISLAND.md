# Dynamic Island Component

Componente inspirado en el Dynamic Island de Apple para mostrar estados dinámicos de la aplicación.

## 📋 Descripción

El Dynamic Island es un componente que muestra diferentes estados y transiciones animadas:
- **Balance** (estado idle)
- **Enviando pago** (sending)
- **Recibiendo pago** (receiving)
- **Convirtiendo moneda** (converting)
- **Procesando** (processing)
- **Éxito** (success)
- **Error** (error)

## 🎨 Características

- ✅ Animaciones fluidas con Framer Motion
- ✅ Transiciones suaves entre estados
- ✅ Gradiente de Loopay con efecto glassmorphic
- ✅ Responsive (mobile y desktop)
- ✅ Estados auto-reset (success/error vuelven a idle después de 3s)
- ✅ Gestión de estado global con Zustand

## 🚀 Uso

### Importar el store

```typescript
import { useDynamicIslandStore } from '../stores/useDynamicIslandStore';
```

### Ejemplos de uso

#### 1. Mostrar estado "Enviando"

```typescript
const { setIslandState } = useDynamicIslandStore();

setIslandState('sending', {
  amount: 5000,
  currency: 'USD',
  recipient: 'Juan Pérez',
  progress: 50, // 0-100
});
```

#### 2. Mostrar estado "Recibiendo"

```typescript
setIslandState('receiving', {
  amount: 3500,
  currency: 'USD',
  sender: 'María García',
});
```

#### 3. Mostrar estado "Convirtiendo"

```typescript
setIslandState('converting', {
  fromCurrency: 'USD',
  toCurrency: 'BRL',
  amount: 10000,
});
```

#### 4. Mostrar éxito

```typescript
const { showSuccess } = useDynamicIslandStore();

showSuccess('¡Pago enviado exitosamente!');
// Auto-reset a "idle" después de 3 segundos
```

#### 5. Mostrar error

```typescript
const { showError } = useDynamicIslandStore();

showError('No hay fondos suficientes');
// Auto-reset a "idle" después de 3 segundos
```

#### 6. Actualizar balance

```typescript
const { setBalance } = useDynamicIslandStore();

setBalance(3374289.500);
```

## 🎯 Integración con Flujos

### Ejemplo: Integración con flujo de pago

```typescript
// En el componente de pago
import { useDynamicIslandStore } from '../stores/useDynamicIslandStore';

function PaymentFlow() {
  const { setIslandState, showSuccess, showError } = useDynamicIslandStore();

  const handleSendPayment = async (data) => {
    // Mostrar estado "enviando"
    setIslandState('sending', {
      amount: data.amount,
      currency: data.currency,
      recipient: data.recipient,
      progress: 0,
    });

    try {
      // Simular progreso
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIslandState('sending', { progress: i });
      }

      // Enviar pago (API call)
      await sendPaymentAPI(data);

      // Mostrar éxito
      showSuccess('Pago enviado exitosamente');
    } catch (error) {
      // Mostrar error
      showError('Error al enviar el pago');
    }
  };

  return (
    // ... componente UI
  );
}
```

## 📊 Estados Disponibles

| Estado | Descripción | Datos requeridos |
|--------|-------------|------------------|
| `idle` | Muestra el balance | `balance` |
| `sending` | Enviando pago | `amount`, `currency`, `recipient`, `progress` (opcional) |
| `receiving` | Recibiendo pago | `amount`, `currency`, `sender` |
| `converting` | Convirtiendo moneda | `fromCurrency`, `toCurrency`, `amount` |
| `processing` | Procesamiento genérico | `message` (opcional) |
| `success` | Operación exitosa | `message` (opcional) |
| `error` | Error en operación | `message` (opcional) |

## 🎨 Customización

El componente usa los estilos del sistema de diseño de Loopay:
- Gradiente: `bg-loopay-gradient`
- Shadow: `shadow-soft-glow`
- Backdrop blur: `backdrop-blur-xl`

## 🧪 Testing

Para probar todos los estados, usa el componente `DynamicIslandDemo`:

```typescript
import { DynamicIslandDemo } from '../components/dynamic-island-demo';

// Renderizar en tu página
<DynamicIslandDemo />
```

Este componente muestra un panel de controles para probar todos los estados del Dynamic Island.

**Nota:** Remover `DynamicIslandDemo` en producción.

## 🔄 Auto-reset

Los estados `success` y `error` se resetean automáticamente al estado `idle` después de 3 segundos. Para evitar este comportamiento, usa `setIslandState` en lugar de `showSuccess`/`showError`.

## 📱 Responsive

El componente ajusta automáticamente su tamaño y contenido según el dispositivo:
- **Mobile**: `text-sm`, `px-6 py-3`, `min-w-[280px]`
- **Desktop**: `text-base`, `px-10 py-4`, `min-w-[320px]`

## 🎬 Animaciones

Todas las animaciones usan Framer Motion con configuración optimizada:
- **Layout animations**: Para cambios de tamaño
- **Content transitions**: Fade in/out entre estados
- **Icon animations**: Rotación, escala, etc.
- **Spring physics**: Para movimientos naturales

## 🛠️ Store API

```typescript
interface DynamicIslandStore {
  islandData: IslandData;
  isExpanded: boolean;
  setIslandState: (state: IslandState, data?: Partial<IslandData>) => void;
  setBalance: (balance: number) => void;
  setExpanded: (expanded: boolean) => void;
  showSuccess: (message?: string) => void;
  showError: (message?: string) => void;
  reset: () => void;
}
```

---

**Creado por:** Loopay Dev Team  
**Inspirado en:** Apple Dynamic Island  
**Framework:** React + Framer Motion + Zustand

