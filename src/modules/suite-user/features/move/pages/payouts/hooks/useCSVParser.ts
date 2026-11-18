import { useCallback, useState } from 'react';

export interface CSVParseResult {
  headers: string[];
  rows: string[][];
  rawData: string;
}

export function useCSVParser() {
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = useCallback((file: File): Promise<CSVParseResult> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) {
            throw new Error('El archivo está vacío');
          }

          // Detectar el separador (coma o punto y coma)
          const firstLine = text.split('\n')[0];
          const separator = firstLine.includes(';') ? ';' : ',';

          // Parsear CSV
          const lines = text.split('\n').filter((line) => line.trim() !== '');

          if (lines.length === 0) {
            throw new Error('El archivo no contiene datos');
          }

          // Extraer headers
          const headers = lines[0].split(separator).map((h) => h.trim().replace(/^"|"$/g, ''));

          // Extraer filas
          const rows = lines.slice(1).map((line) => {
            return line.split(separator).map((cell) => cell.trim().replace(/^"|"$/g, ''));
          });

          const result: CSVParseResult = {
            headers,
            rows,
            rawData: text,
          };

          setParseResult(result);
          setIsLoading(false);
          resolve(result);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'No pudimos leer el archivo';
          setError(errorMessage);
          setIsLoading(false);
          reject(new Error(errorMessage));
        }
      };

      reader.onerror = () => {
        const errorMessage = 'No pudimos leer el archivo';
        setError(errorMessage);
        setIsLoading(false);
        reject(new Error(errorMessage));
      };

      reader.readAsText(file);
    });
  }, []);

  const reset = useCallback(() => {
    setParseResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    parseResult,
    isLoading,
    error,
    parseCSV,
    reset,
  };
}
