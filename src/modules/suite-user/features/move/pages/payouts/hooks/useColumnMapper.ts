import { useCallback, useMemo, useState } from 'react';

export const EXPECTED_COLUMNS = [
  'valor',
  'nombre',
  'tipo de documento',
  'numero de documento',
  'referencia',
  'numero de cuenta',
  'tipo de cuenta',
  'banco',
] as const;

export type ExpectedColumn = (typeof EXPECTED_COLUMNS)[number];

export interface ColumnMapping {
  [key: string]: ExpectedColumn | '';
}

export interface MappedRow {
  valor?: string;
  nombre?: string;
  'tipo de documento'?: string;
  'numero de documento'?: string;
  referencia?: string;
  'numero de cuenta'?: string;
  'tipo de cuenta'?: string;
  banco?: string;
}

/**
 * Calcula la similitud de Jaro entre dos strings
 */
function jaroSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
  const str1Matches = new Array(str1.length).fill(false);
  const str2Matches = new Array(str2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Identificar coincidencias
  for (let i = 0; i < str1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, str2.length);

    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  // Contar transposiciones
  let k = 0;
  for (let i = 0; i < str1.length; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  return (
    (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3
  );
}

/**
 * Calcula la similitud de Jaro-Winkler entre dos strings
 * Retorna un valor entre 0 (totalmente diferentes) y 100 (idénticos)
 */
function jaroWinklerSimilarity(str1: string, str2: string): number {
  const jaroScore = jaroSimilarity(str1, str2);

  // Calcular prefijo común (máximo 4 caracteres)
  let prefixLength = 0;
  const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));

  for (let i = 0; i < maxPrefix; i++) {
    if (str1[i] === str2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }

  // Factor de escala para Jaro-Winkler (típicamente 0.1)
  const scalingFactor = 0.1;

  // Calcular Jaro-Winkler
  const jaroWinklerScore = jaroScore + prefixLength * scalingFactor * (1 - jaroScore);

  // Convertir a porcentaje
  return jaroWinklerScore * 100;
}

export function useColumnMapper(headers: string[]) {
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});

  // Auto-mapeo basado en Jaro-Winkler con umbral del 60%
  const autoMapColumns = useCallback(() => {
    const mapping: ColumnMapping = {};
    const SIMILARITY_THRESHOLD = 60; // 60% de similitud mínima
    const usedExpectedColumns = new Set<ExpectedColumn>(); // Evitar duplicados

    headers.forEach((header) => {
      const normalizedHeader = header.toLowerCase().trim();

      // Buscar coincidencia exacta primero
      const exactMatch = EXPECTED_COLUMNS.find((col) => col.toLowerCase() === normalizedHeader);

      if (exactMatch && !usedExpectedColumns.has(exactMatch)) {
        mapping[header] = exactMatch;
        usedExpectedColumns.add(exactMatch);
        return;
      } else if (exactMatch && usedExpectedColumns.has(exactMatch)) {
        return;
      }

      // Calcular similitud con todas las columnas esperadas usando Jaro-Winkler
      let bestMatch: ExpectedColumn | null = null;
      let bestSimilarity = 0;

      EXPECTED_COLUMNS.forEach((expectedCol) => {
        if (usedExpectedColumns.has(expectedCol)) {
          return;
        }

        const normalizedExpected = expectedCol.toLowerCase();
        const similarity = jaroWinklerSimilarity(normalizedHeader, normalizedExpected);

        if (similarity >= SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = expectedCol;
        }
      });

      if (bestMatch) {
        mapping[header] = bestMatch;
        usedExpectedColumns.add(bestMatch);
      }
    });

    setColumnMapping(mapping);
  }, [headers]);

  // Mapear una columna manualmente
  const mapColumn = useCallback((csvHeader: string, expectedColumn: ExpectedColumn | '') => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvHeader]: expectedColumn,
    }));
  }, []);

  // Convertir filas usando el mapeo
  const mapRows = useCallback(
    (rows: string[][]): MappedRow[] => {
      return rows.map((row) => {
        const mappedRow: MappedRow = {};

        headers.forEach((header, index) => {
          const mappedColumn = columnMapping[header];
          if (mappedColumn) {
            mappedRow[mappedColumn] = row[index];
          }
        });

        return mappedRow;
      });
    },
    [headers, columnMapping]
  );

  // Validar que todos los campos requeridos estén mapeados
  const isMappingComplete = useMemo(() => {
    const mappedColumns = Object.values(columnMapping).filter((col) => col !== '');
    return EXPECTED_COLUMNS.every((expectedCol) => mappedColumns.includes(expectedCol));
  }, [columnMapping]);

  // Obtener columnas faltantes
  const missingColumns = useMemo(() => {
    const mappedColumns = Object.values(columnMapping).filter((col) => col !== '');
    return EXPECTED_COLUMNS.filter((col) => !mappedColumns.includes(col));
  }, [columnMapping]);

  const resetMapping = useCallback(() => {
    setColumnMapping({});
  }, []);

  return {
    columnMapping,
    mapColumn,
    mapRows,
    autoMapColumns,
    isMappingComplete,
    missingColumns,
    resetMapping,
  };
}
