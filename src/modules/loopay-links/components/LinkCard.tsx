import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Eye, EyeOff, GripVertical, DollarSign, Info } from '@/shared/components/animated-icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { useLinksStore, type LinkItem } from '../stores/useLinksStore';
import { cn } from '@/shared/lib/utils';

interface LinkCardProps {
  link: LinkItem;
  isNew?: boolean;
  onSave?: () => void;
}

/**
 * LinkCard - Payment button editor
 * 
 * Features:
 * - Intelligent amount input (like dashboard)
 * - Currency & settlement selection
 * - Toggle active/inactive with Switch
 * - Delete action
 * - Drag & drop reordering
 * - Real-time updates to store
 */
export function LinkCard({ link, isNew = false, onSave }: LinkCardProps) {
  const { updateLink, deleteLink, toggleLinkActive } = useLinksStore();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Auto-focus title input on new cards
  useEffect(() => {
    if (isNew && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isNew]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLink(link.id, { title: e.target.value });
    onSave?.();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    updateLink(link.id, { amount });
    onSave?.();
  };

  const handleCurrencyChange = (currency: string) => {
    updateLink(link.id, { currency: currency as any });
    onSave?.();
  };

  const handleSettlementChange = (strategy: string) => {
    const isCryptoWallet = strategy === 'VAULT';
    updateLink(link.id, {
      settlementStrategy: isCryptoWallet ? 'CRYPTO_WALLET' : 'FIAT_BANK',
      receiveCurrency: isCryptoWallet ? 'USDC' : 'COP',
    });
    onSave?.();
  };

  const handleDelete = () => {
    deleteLink(link.id);
    onSave?.();
  };

  const handleToggle = () => {
    toggleLinkActive(link.id);
    onSave?.();
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative bg-card border-2 rounded-xl p-4 transition-colors duration-150',
        isNew
          ? 'border border-border shadow-sm'
          : 'border border-transparent',
        isDragging && 'opacity-50 cursor-grabbing z-50'
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="space-y-4">
        {/* Header: Icon + 0% Fees Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Button
            </span>
          </div>
          
          {/* 0% Fees Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-2 py-1 bg-success/10 border border-success/20 rounded-full text-[10px] font-semibold text-success"
          >
            0% Fees
          </motion.div>
        </div>

        {/* Controls: Icon + Toggle + Delete */}
        <div className="flex items-center justify-between gap-3">
          {/* Icon/Emoji Selector */}
          <button
            type="button"
            className="shrink-0 w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-xl transition-colors"
          >
            {link.icon || '🔗'}
          </button>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              {link.active ? (
                <Eye className="w-4 h-4 text-success" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
              <Switch
                checked={link.active}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-success"
              />
            </div>

            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors group/delete"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground group-hover/delete:text-destructive transition-colors" />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1">
          <label htmlFor={`title-${link.id}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Concepto
          </label>
          <Input
            id={`title-${link.id}`}
            ref={titleInputRef}
            value={link.title}
            onChange={handleTitleChange}
            placeholder="Ej: Consultoría, Producto..."
            className="font-body"
          />
        </div>

        {/* Amount Input - Intelligent Input Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Monto
          </label>
          <div className="flex items-center gap-2 bg-muted/20 rounded-xl p-3 border-2 border-border/50 focus-within:border-primary transition-colors">
            {/* Currency Selector */}
            <Select
              value={link.currency}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="w-[90px] border-0 bg-transparent text-sm font-semibold focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">🇺🇸 USD</SelectItem>
                <SelectItem value="COP">🇨🇴 COP</SelectItem>
                <SelectItem value="USDT">💎 USDT</SelectItem>
                <SelectItem value="USDC">💠 USDC</SelectItem>
              </SelectContent>
            </Select>

            {/* Amount Input - Large */}
            <input
              ref={amountInputRef}
              type="number"
              step="0.01"
              min="0"
              value={link.amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="flex-1 bg-transparent border-0 outline-none text-3xl font-bold tabular-nums text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Settlement Method - "Recibir en" (optional, future) */}
        {link.settlementStrategy && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recibir en
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Elige dónde quieres recibir los fondos. Bank Settlement requiere registro.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={link.settlementStrategy === 'CRYPTO_WALLET' ? 'VAULT' : 'BANK'}
              onValueChange={handleSettlementChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VAULT">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Loopay Vault (USDC)</p>
                      <p className="text-xs text-muted-foreground">Instant settlement</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="BANK">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-success" />
                    <div className="text-left">
                      <p className="font-medium">Local Bank (COP)</p>
                      <p className="text-xs text-muted-foreground">1-2 business days</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </motion.div>
  );
}

