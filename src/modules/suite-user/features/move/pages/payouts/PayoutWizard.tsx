/**
 * Payout Wizard Component
 * 
 * Clean, minimalist wizard for creating single or batch payouts.
 * Steps:
 * 1. Upload CSV or fill form
 * 2. Validate data
 * 3. Review and confirm dispersion
 */

import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';

const inputFieldClass = "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Users,
  Info,
  Wallet,
} from '@/shared/components/animated-icons';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLingui } from '@lingui/react/macro';
import { DynamicIsland } from '@/shared/components/DynamicIsland';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';
import {
  EXPECTED_COLUMNS,
  useColumnMapper,
  useCreateBuilderPayment,
  useCSVParser,
  usePayoutValidation,
  useBankNormalizer,
  type MappedRow,
} from './hooks';
import { useDocumentTypes } from './hooks/useDocumentTypes';
import { Button } from '@/shared/components/ui/button';
import { useLiquidationAddresses } from '@/modules/suite-user/features/account/hooks/useLiquidationAddresses';

interface PayoutWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (batchId: string) => void;
}

type WizardMode = 'select' | 'single' | 'batch';
type WizardStep = 'input' | 'validate' | 'review';

// Helper to get chain icon/color
const getChainInfo = (chain: string) => {
  const chains: Record<string, { color: string; label: string }> = {
    ethereum: { color: 'text-primary', label: 'Ethereum' },
    base: { color: 'text-primary', label: 'Base' },
    tron: { color: 'text-destructive', label: 'Tron' },
    solana: { color: 'text-chart-5', label: 'Solana' },
    polygon: { color: 'text-chart-4', label: 'Polygon' },
  };
  return chains[chain?.toLowerCase()] || { color: 'text-muted-foreground', label: chain };
};

// Helper to truncate address
const truncateAddress = (address: string) => {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function PayoutWizard({ open, onOpenChange, onSuccess }: PayoutWizardProps) {
  const { t } = useLingui();
  // Mode and step control
  const [mode, setMode] = useState<WizardMode>('select');
  const [step, setStep] = useState<WizardStep>('input');
  const [executing, setExecuting] = useState(false);
  const [selectedLiquidationAddress, setSelectedLiquidationAddress] = useState<string>('');

  // Dynamic Island store
  const { setStep: setIslandStep, hide: hideIsland, reset: resetIsland } = useDynamicIslandStore();

  // Single payout form
  const [singleForm, setSingleForm] = useState({
    nombre: '',
    tipoDocumento: '',
    numeroDocumento: '',
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    valor: '',
    referencia: '',
  });

  // Batch payout (CSV)
  const [file, setFile] = useState<File | null>(null);
  const [mappedData, setMappedData] = useState<MappedRow[]>([]);
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [bankValidation, setBankValidation] = useState<{
    isValid: boolean;
    normalizedName: string;
    confidence: number;
    matchType: string;
  } | null>(null);

  // Hooks
  const { parseResult, isLoading: isParsing, error: parseError, parseCSV, reset: resetParser } = useCSVParser();
  const { columnMapping, mapColumn, mapRows, autoMapColumns, isMappingComplete, missingColumns, resetMapping } = useColumnMapper(parseResult?.headers || []);
  const { validateRows } = usePayoutValidation();
  const { createPayment } = useCreateBuilderPayment();
  const { documentTypes, isLoading: isLoadingDocTypes } = useDocumentTypes();
  const { findBank } = useBankNormalizer();
  const { liquidationAddresses, isLoading: isLoadingLiquidation } = useLiquidationAddresses();

  // Reset wizard on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setMode('select');
        setStep('input');
        setFile(null);
        setMappedData([]);
        setSingleForm({
          nombre: '',
          tipoDocumento: '',
          numeroDocumento: '',
          banco: '',
          tipoCuenta: '',
          numeroCuenta: '',
          valor: '',
          referencia: '',
        });
        setBankValidation(null);
        setSelectedLiquidationAddress('');
        resetParser();
        resetMapping();
        setShowColumnMapping(false);
        resetIsland();
      }, 200);
    }
  }, [open, resetParser, resetMapping, resetIsland]);

  // Update Dynamic Island based on mode and step
  useEffect(() => {
    if (!open) return;

    if (mode === 'select') {
      hideIsland();
      return;
    }

    const totalSteps = 3;
    let currentStep = 0;
    let stepName = '';

    if (step === 'input') {
      currentStep = 0;
      stepName = mode === 'single' ? t`Datos del beneficiario` : t`Cargar archivo CSV`;
    } else if (step === 'validate') {
      currentStep = 1;
      stepName = mode === 'single' ? t`Validar información` : t`Mapear y validar columnas`;
    } else if (step === 'review') {
      currentStep = 2;
      stepName = t`Confirmar y enviar`;
    }

    setIslandStep(currentStep, totalSteps, stepName);
  }, [open, mode, step, setIslandStep, hideIsland]);

  // Total amount calculation
  const totalAmount = useMemo(() => {
    if (mode === 'single' && singleForm.valor) {
      const cleaned = singleForm.valor.replace(/[^0-9.-]/g, '');
      return parseFloat(cleaned) || 0;
    }

    return mappedData.reduce((sum, row) => {
      const valor = row.valor;
      if (!valor) return sum;
      const cleanValue = typeof valor === 'string' ? valor.replace(/[^0-9.-]/g, '') : String(valor);
      const numericValue = parseFloat(cleanValue);
      return sum + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);
  }, [mode, singleForm.valor, mappedData]);

  const beneficiariesCount = mode === 'single' ? 1 : mappedData.length;

  // Handle file upload
  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      resetParser();
      resetMapping();
      setShowColumnMapping(false);
      setMappedData([]);
      return;
    }

    setFile(selectedFile);
    try {
      await parseCSV(selectedFile);
    } catch (error) {
      toast.error(t`No pudimos procesar el archivo CSV`);
      console.error(error);
    }
  };

  // Handle column mapping apply
  const handleApplyMapping = () => {
    if (!parseResult || !isMappingComplete) {
      toast.error(t`Mapea todas las columnas requeridas para continuar`);
      return;
    }

    const mapped = mapRows(parseResult.rows);

    const validationResult = validateRows(mapped);

    if (!validationResult.isValid) {
      toast.error(
        t`Se encontraron ${validationResult.errors.length} error(es) en los datos.`,
        { duration: 5000 }
      );
      return;
    }

    setMappedData(mapped);
    setShowColumnMapping(false);
    setStep('review');
    toast.success(t`${mapped.length} registros validados`);
  };

  // Handle single form validation
  const handleValidateSingle = () => {
    // Convert single form to MappedRow array
    const singleRow: MappedRow = {
      nombre: singleForm.nombre,
      'tipo de documento': singleForm.tipoDocumento,
      'numero de documento': singleForm.numeroDocumento,
      banco: singleForm.banco,
      'numero de cuenta': singleForm.numeroCuenta,
      'tipo de cuenta': singleForm.tipoCuenta,
      valor: singleForm.valor,
      referencia: singleForm.referencia,
    };

    const validationResult = validateRows([singleRow]);

    if (!validationResult.isValid) {
      toast.error(t`Revisa los campos antes de continuar`);
      return;
    }

    setMappedData([singleRow]);
    setStep('review');
    toast.success(t`Todo en orden`);
  };

  // Handle confirm and execute
  const handleConfirm = async () => {
    setExecuting(true);

    try {
      const response = await createPayment({
        paymentData: mappedData,
      });

      if (response && response.success) {
        toast.success(response.message);
        onSuccess(response.batchId);
        onOpenChange(false);
      } else {
        // Display the error message from the response
        const errorMessage = response?.message || t`No pudimos procesar los pagos`;
        toast.error(errorMessage, {
          duration: 6000,
          description: t`Verifica los datos e intenta de nuevo.`,
        });
      }
    } catch (error) {
      console.error('Error en handleConfirm:', error);
      toast.error(t`Algo salió mal al procesar los pagos`, {
        duration: 5000,
      });
    } finally {
      setExecuting(false);
    }
  };

  // Check if single form is complete
  const isSingleFormComplete = useMemo(() => {
    return Object.values(singleForm).every((value) => value.trim() !== '');
  }, [singleForm]);

  // Validate bank name when user types
  useEffect(() => {
    if (singleForm.banco.trim() === '') {
      setBankValidation(null);
      return;
    }

    const result = findBank(singleForm.banco);
    setBankValidation({
      isValid: result.matchType !== 'none',
      normalizedName: result.normalizedName,
      confidence: result.confidence,
      matchType: result.matchType,
    });
  }, [singleForm.banco, findBank]);

  // Auto-show column mapping when CSV is parsed
  useEffect(() => {
    if (parseResult && !parseError && mode === 'batch' && step === 'input') {
      // Cambiar al step "validate" para mostrar el mapeo de columnas
      setStep('validate');
      setShowColumnMapping(true);
      // Auto-mapear columnas cuando se parsea el CSV
      autoMapColumns();
    }
  }, [parseResult, parseError, mode, step, autoMapColumns]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'fixed! left-[50%]! top-[50%]! translate-x-[-50%]! translate-y-[-50%]!',
          'border border-border bg-card text-foreground',
          'shadow-lg',
          'sm:max-w-2xl max-h-[90vh] overflow-hidden'
        )}
      >
        {/* Dynamic Island */}
        {mode !== 'select' && <DynamicIsland showBalance={false} />}

        {mode !== 'select' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center mt-4 mb-6"
            >
              <h2 className="font-heading text-lg font-semibold text-foreground">
                <TypewriterText
                  text={
                    step === 'input'
                      ? (mode === 'single' ? t`¿A quién le envías?` : t`Carga tu archivo CSV`)
                      : step === 'validate'
                        ? t`Verifica el mapeo de columnas`
                        : t`Revisa y confirma la dispersión`
                  }
                  speed={30}
                  delay={0}
                />
              </h2>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Mode Selection */}
        {mode === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Nueva dispersión
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Elige cómo deseas crear tu dispersión
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setMode('single');
                  setStep('input');
                }}
                className={cn(
                  'w-full p-6 h-auto rounded-xl border border-border/50 bg-foreground/5',
                  'hover:bg-foreground/10 hover:border-border transition-colors duration-150',
                  'text-left group justify-start'
                )}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Pago individual</h3>
                    <p className="text-sm text-muted-foreground">
                      Completa un formulario para enviar un solo pago
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground/80 transition-colors" />
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setMode('batch');
                  setStep('input');
                }}
                className={cn(
                  'w-full p-6 h-auto rounded-xl border border-border/50 bg-foreground/5',
                  'hover:bg-foreground/10 hover:border-border transition-colors duration-150',
                  'text-left group justify-start'
                )}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <Users className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Dispersión masiva</h3>
                    <p className="text-sm text-muted-foreground">
                      Sube un archivo CSV para procesar múltiples pagos
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground/80 transition-colors" />
                </div>
              </Button>
            </div>
          </>
        )}

        {/* Single Payout Form */}
        {mode === 'single' && step === 'input' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Pago individual
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Completa los datos del beneficiario
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6 px-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Nombre del beneficiario</Label>
                <Input
                  placeholder="Ej: Juan Pérez"
                  value={singleForm.nombre}
                  onChange={(e) => setSingleForm({ ...singleForm, nombre: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tipo de documento</Label>
                  <Select
                    value={singleForm.tipoDocumento}
                    onValueChange={(value) => setSingleForm({ ...singleForm, tipoDocumento: value })}
                  >
                    <SelectTrigger className={inputFieldClass}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDocTypes ? (
                        <SelectItem value="loading" disabled>Un momento...</SelectItem>
                      ) : (
                        documentTypes.map((dt) => (
                          <SelectItem key={dt.id} value={dt.type.toLowerCase()}>
                            {dt.type.toUpperCase()}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Número de documento</Label>
                  <Input
                    placeholder="Ej: 1234567890"
                    value={singleForm.numeroDocumento}
                    onChange={(e) => setSingleForm({ ...singleForm, numeroDocumento: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Banco</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Ej: Bancolombia, Bogota, Davivienda..."
                    value={singleForm.banco}
                    onChange={(e) => setSingleForm({ ...singleForm, banco: e.target.value })}
                    className={cn(
                      bankValidation && !bankValidation.isValid && 'border-destructive/50'
                    )}
                  />
                  
                  {/* Bank validation feedback */}
                  {bankValidation && bankValidation.isValid && (
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span className="text-success">
                        {bankValidation.matchType === 'exact' && (
                          <>Banco válido: <strong>{bankValidation.normalizedName}</strong></>
                        )}
                        {bankValidation.matchType === 'alternative' && (
                          <>Banco reconocido: <strong>{bankValidation.normalizedName}</strong></>
                        )}
                        {bankValidation.matchType === 'fuzzy' && (
                          <>Se normalizó a: <strong>{bankValidation.normalizedName}</strong> ({bankValidation.confidence.toFixed(0)}% similitud)</>
                        )}
                      </span>
                    </div>
                  )}
                  
                  {bankValidation && !bankValidation.isValid && (
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-destructive">
                        Banco no reconocido. Verifica el nombre.
                      </span>
                    </div>
                  )}
                  
                  {!bankValidation && singleForm.banco.trim() !== '' && (
                    <div className="flex items-center gap-2 text-xs">
                      <Info className="h-3.5 w-3.5 text-primary" />
                      <span className="text-primary">
                        Escribe el nombre del banco (se normalizará automáticamente)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tipo de cuenta</Label>
                  <Select
                    value={singleForm.tipoCuenta}
                    onValueChange={(value) => setSingleForm({ ...singleForm, tipoCuenta: value })}
                  >
                    <SelectTrigger className={inputFieldClass}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ahorros">Ahorros</SelectItem>
                      <SelectItem value="corriente">Corriente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Número de cuenta</Label>
                  <Input
                    placeholder="Ej: 1234567890"
                    value={singleForm.numeroCuenta}
                    onChange={(e) => setSingleForm({ ...singleForm, numeroCuenta: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Valor (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="Ej: 50000"
                    value={singleForm.valor}
                    onChange={(e) => setSingleForm({ ...singleForm, valor: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Referencia *</Label>
                  <Input
                    placeholder="Requerido"
                    value={singleForm.referencia}
                    onChange={(e) => setSingleForm({ ...singleForm, referencia: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => setMode('select')}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                variant="default"
                onClick={handleValidateSingle}
                disabled={!isSingleFormComplete}
                className="flex-1"
              >
                Validar y continuar
              </Button>
            </div>
          </>
        )}

        {/* Batch Payout (CSV Upload) - Step: Input */}
        {mode === 'batch' && step === 'input' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Dispersión masiva
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Sube un archivo CSV con los datos de los beneficiarios
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <label
                htmlFor="csv-upload"
                className={cn(
                  inputFieldClass,
                  'flex cursor-pointer flex-col items-center justify-center gap-3',
                  'border-dashed border-border bg-foreground/5 py-12 text-center text-muted-foreground',
                  'hover:bg-foreground/10 hover:border-border transition-colors duration-150'
                )}
              >
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {file ? file.name : 'Arrastra CSV o haz clic'}
                </span>
                <span className="text-xs text-muted-foreground">
                  Formato: Nombre, Tipo doc, Nº doc, Banco, Tipo cuenta, Nº cuenta, Valor, Referencia
                </span>
              </label>

              {isParsing && (
                <Card className="bg-primary/10 border border-primary/30 p-6">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>{t`Un momento...`}</span>
                  </div>
                </Card>
              )}

              {parseError && (
                <Card className="bg-destructive/10 border border-destructive/30 p-6">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{parseError}</span>
                  </div>
                </Card>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => setMode('select')}
                className="flex-1"
              >
                Volver
              </Button>
            </div>
          </>
        )}

        {/* Batch Payout - Step: Validate (Column Mapping) */}
        {mode === 'batch' && step === 'validate' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Mapear y validar columnas
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Asocia las columnas del CSV con los campos requeridos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              {parseResult && showColumnMapping && (
                <Card className="bg-card/85 p-6">
                  <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>Mapeo de columnas</span>
                    </div>
                    {!isMappingComplete && (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {missingColumns.length} faltantes
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Las columnas se han mapeado automáticamente. Puedes ajustarlas si es necesario.
                  </p>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {EXPECTED_COLUMNS.map((expectedCol, idx) => {
                      const mappedHeader = Object.entries(columnMapping).find(
                        ([, value]) => value === expectedCol
                      )?.[0];

                      const usedHeaders = Object.entries(columnMapping)
                        .filter(([, value]) => value !== expectedCol && value !== '')
                        .map(([key]) => key);

                      const searchTerm = searchTerms[expectedCol] || '';
                      const filteredHeaders = parseResult.headers.filter((header) =>
                        header.toLowerCase().includes(searchTerm.toLowerCase())
                      );

                      return (
                        <div key={idx} className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground capitalize">
                            {expectedCol}
                          </Label>
                          <Select
                            value={mappedHeader || '__unmapped__'}
                            onValueChange={(value) => {
                              if (mappedHeader) mapColumn(mappedHeader, '');
                              if (value !== '__unmapped__') mapColumn(value, expectedCol);
                              setSearchTerms((prev) => ({ ...prev, [expectedCol]: '' }));
                            }}
                          >
                            <SelectTrigger className={cn(inputFieldClass, 'w-full')}>
                              <SelectValue placeholder="Seleccionar columna" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__unmapped__">Sin mapear</SelectItem>
                              {filteredHeaders.map((header) => {
                                const isDisabled = usedHeaders.includes(header);
                                return (
                                  <SelectItem
                                    key={header}
                                    value={header}
                                    disabled={isDisabled}
                                  >
                                    {header} {isDisabled && '(ya usada)'}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>

                  {missingColumns.length > 0 && (
                    <Card className="bg-warning/10 border border-warning/30 p-6">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-warning">
                          Columnas faltantes:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {missingColumns.map((col) => (
                            <Badge variant="secondary" key={col}>{col}</Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}
                  </div>
                </Card>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep('input');
                  setShowColumnMapping(false);
                  setFile(null);
                  resetParser();
                  resetMapping();
                  setMappedData([]);
                }}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                variant="default"
                onClick={handleApplyMapping}
                disabled={!isMappingComplete}
                className="flex-1"
              >
                {isMappingComplete ? 'Validar y continuar' : 'Completa el mapeo'}
              </Button>
            </div>
          </>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Confirmar dispersión
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Revisa el resumen antes de confirmar
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6 max-h-[60vh] overflow-y-auto">
              <Card className="bg-success/10 border border-success/30 p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm font-semibold text-success">
                      Datos validados
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Beneficiarios</p>
                      <p className="text-2xl font-bold text-foreground">{beneficiariesCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Monto total</p>
                      <p className="text-2xl font-bold font-mono tabular-nums text-foreground">
                        ${totalAmount.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Moneda</p>
                      <p className="text-2xl font-bold text-foreground">COP</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Liquidation Address Selection */}
              <Card className="bg-foreground/5 border border-border/50 p-6">
                <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Dirección de liquidación
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Selecciona la dirección desde donde se debitarán los fondos
                </p>

                {isLoadingLiquidation ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Un momento...</span>
                  </div>
                ) : liquidationAddresses.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-warning">
                    <AlertCircle className="h-4 w-4" />
                    <span>No tienes direcciones de liquidación configuradas</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {liquidationAddresses.map((addr) => {
                      const chainInfo = getChainInfo(addr.chain);
                      const isSelected = selectedLiquidationAddress === addr.liquidationAddressId;
                      
                      return (
                        <Button
                          key={addr.liquidationAddressId}
                          variant="ghost"
                          onClick={() => setSelectedLiquidationAddress(addr.liquidationAddressId)}
                          className={cn(
                            'w-full p-3 h-auto rounded-lg border text-left transition-colors duration-150 justify-start',
                            isSelected
                              ? 'border-primary/50 bg-primary/10 hover:bg-primary/15'
                              : 'border-border/50 bg-foreground/5 hover:bg-foreground/10 hover:border-border'
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-2 h-2 rounded-full',
                                isSelected ? 'bg-primary' : 'bg-foreground/30'
                              )} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={cn('text-xs font-medium uppercase', chainInfo.color)}>
                                    {chainInfo.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground uppercase">
                                    {addr.currency}
                                  </span>
                                </div>
                                <p className="text-sm font-mono text-foreground/80 mt-0.5">
                                  {truncateAddress(addr.address)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Destino</p>
                              <p className="text-xs text-muted-foreground uppercase">
                                {addr.destinationCurrency}
                              </p>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
                </div>
              </Card>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => setStep('input')}
                disabled={executing}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={executing || !selectedLiquidationAddress}
                className="flex-1"
              >
                {executing ? t`Un momento...` : t`Confirmar dispersión`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
