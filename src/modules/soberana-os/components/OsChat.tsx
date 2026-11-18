import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { RotateCcw, Globe, ArrowLeft } from '@/shared/components/animated-icons';
import SoberanaLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import SoberanaLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import { useOsChatStore } from '../stores/useOsChatStore';
import { knowledgeBase } from '../knowledge/knowledge-base';
import { OsMessage } from './OsMessage';
import { OsInput } from './OsInput';
import { OsSuggestionChips } from './OsSuggestionChips';
import { OsTypingIndicator } from './OsTypingIndicator';
import { OsWelcome } from './OsWelcome';

interface OsChatProps {
  language: 'en' | 'es';
  onToggleLanguage: () => void;
}

function getChipLabel(entryId: string, language: 'en' | 'es'): string {
  const entry = knowledgeBase.find((e) => e.id === entryId);
  if (!entry) return entryId;
  return language === 'es' ? (entry.questionEs || entry.question) : entry.question;
}

export function OsChat({ language, onToggleLanguage }: OsChatProps) {
  const {
    messages,
    isTyping,
    isStreaming,
    streamingMessageId,
    hasStarted,
    sendMessage,
    selectSuggestion,
    setLanguage,
    reset,
  } = useOsChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const lastSoberanaMessage = [...messages].reverse().find((m) => m.role === 'soberana');
  const showSuggestions =
    !isTyping &&
    !isStreaming &&
    lastSoberanaMessage &&
    lastSoberanaMessage.id !== streamingMessageId &&
    (lastSoberanaMessage.suggestions?.length ?? 0) > 0;

  const currentSuggestions = lastSoberanaMessage?.suggestions ?? [];

  const isBusy = isTyping || isStreaming;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] bg-card/80 backdrop-blur-xl rounded-xl shadow-2xl border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-border/30 bg-linear-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/docs"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded-lg hover:bg-muted/50 shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Docs</span>
          </Link>
          <div className="h-5 w-px bg-border/40 shrink-0" />
          <img src={SoberanaLogoLight} alt="Soberana" className="h-5 sm:h-6 w-auto shrink-0 dark:hidden" />
          <img src={SoberanaLogoDark} alt="Soberana" className="h-5 sm:h-6 w-auto shrink-0 hidden dark:block" />
          <div className="min-w-0">
            <h1 className="text-sm font-heading font-bold text-foreground truncate">Soberana OS</h1>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">
              {language === 'es' ? 'Pregúntame lo que quieras' : 'Ask me anything'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 sm:px-2 py-1 rounded-lg hover:bg-muted/50"
          >
            <Globe className="h-3.5 w-3.5" />
            {language === 'es' ? 'EN' : 'ES'}
          </button>
          {hasStarted && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 sm:px-2 py-1 rounded-lg hover:bg-muted/50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {!hasStarted ? (
          <OsWelcome language={language} onSelect={selectSuggestion} />
        ) : (
          <div className="py-4 space-y-1">
            {messages.map((msg) => (
              <OsMessage
                key={msg.id}
                message={msg}
                isStreaming={msg.id === streamingMessageId}
              />
            ))}
            <AnimatePresence>{isTyping && <OsTypingIndicator />}</AnimatePresence>
            {showSuggestions && (
              <OsSuggestionChips
                suggestions={currentSuggestions.map((id) => ({
                  id,
                  label: getChipLabel(id, language),
                }))}
                onSelect={selectSuggestion}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <OsInput
        onSend={sendMessage}
        disabled={isBusy}
        placeholder={
          language === 'es' ? 'Pregúntale a Soberana...' : 'Ask Soberana anything...'
        }
      />
    </div>
  );
}
