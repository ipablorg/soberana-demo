import { useState } from 'react';
import { OsChat } from '../components/OsChat';

export default function SoberanaOsPage() {
  const [language, setLanguage] = useState<'en' | 'es'>('es');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-background pointer-events-none" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-2 sm:p-4 md:p-8 pb-[140px] sm:pb-[148px]">
        <div className="w-full max-w-3xl h-[calc(100vh-1rem-140px)] sm:h-[calc(100vh-2rem-148px)] md:h-[calc(100vh-4rem-148px)]">
          <OsChat language={language} onToggleLanguage={toggleLanguage} />
        </div>
      </div>
    </div>
  );
}
