/**
 * Bank Normalizer Hook
 *
 * Normalizes bank names from CSV data to match the exact bank names
 * from the backend, including fuzzy matching and alternative names.
 */

import { GetBanksDocument } from '@/graphql/queries/management/banks';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useMemo } from 'react';

/**
 * Bank interface from GraphQL response
 */
interface Bank {
  id: number;
  name: string;
  active: boolean;
  countryId: number;
  alternativeName: string[];
}

/**
 * Normalized bank result
 */
interface NormalizedBank {
  originalName: string;
  normalizedName: string;
  bankId: number;
  confidence: number;
  matchType: 'exact' | 'alternative' | 'fuzzy' | 'none';
}

/**
 * Calcula la similitud de Jaro-Winkler entre dos strings
 * Retorna un valor entre 0 (totalmente diferentes) y 100 (idénticos)
 */
function jaroWinklerSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 100;
  if (str1.length === 0 || str2.length === 0) return 0;

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

  if (matches === 0) return 0;

  // Contar transposiciones
  let k = 0;
  for (let i = 0; i < str1.length; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  const jaroScore =
    (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3;

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
  const jaroWinklerScore = jaroScore + prefixLength * scalingFactor * (1 - jaroScore);

  return jaroWinklerScore * 100;
}

/**
 * Normaliza un string para comparación:
 * - Convierte a minúsculas
 * - Elimina acentos
 * - Elimina caracteres especiales
 * - Elimina espacios extras
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

export function useBankNormalizer() {
  // Fetch all banks
  const {
    data: banksData,
    isLoading,
    error,
  } = useGraphQLQuery(['management', 'banks'], GetBanksDocument as any, undefined, {
    staleTime: 1000 * 60 * 60, // Cache por 1 hora
    gcTime: 1000 * 60 * 60,
  });

  // Get all banks
  const banks: Bank[] = useMemo(() => {
    return (banksData as any)?.banks || [];
  }, [banksData]);

  // Get only active banks
  const activeBanks = useMemo(() => {
    return banks.filter((bank) => bank.active);
  }, [banks]);

  /**
   * Busca un banco por nombre exacto, nombres alternativos o fuzzy matching
   */
  const findBank = (bankName: string): NormalizedBank => {
    if (!bankName || bankName.trim() === '') {
      return {
        originalName: bankName,
        normalizedName: '',
        bankId: -1,
        confidence: 0,
        matchType: 'none',
      };
    }

    const normalizedInput = normalizeString(bankName);

    // 1. Buscar coincidencia exacta en el nombre principal
    for (const bank of activeBanks) {
      if (normalizeString(bank.name) === normalizedInput) {
        return {
          originalName: bankName,
          normalizedName: bank.name,
          bankId: bank.id,
          confidence: 100,
          matchType: 'exact',
        };
      }
    }

    // 2. Buscar en nombres alternativos
    for (const bank of activeBanks) {
      for (const altName of bank.alternativeName || []) {
        if (normalizeString(altName) === normalizedInput) {
          return {
            originalName: bankName,
            normalizedName: bank.name,
            bankId: bank.id,
            confidence: 95,
            matchType: 'alternative',
          };
        }
      }
    }

    // 3. Fuzzy matching con umbral del 80%
    const FUZZY_THRESHOLD = 80;
    let bestMatch: Bank | null = null;
    let bestSimilarity = 0;

    for (const bank of activeBanks) {
      // Comparar con nombre principal
      const nameSimilarity = jaroWinklerSimilarity(normalizedInput, normalizeString(bank.name));

      if (nameSimilarity > bestSimilarity) {
        bestSimilarity = nameSimilarity;
        bestMatch = bank;
      }

      // Comparar con nombres alternativos
      for (const altName of bank.alternativeName || []) {
        const altSimilarity = jaroWinklerSimilarity(normalizedInput, normalizeString(altName));
        if (altSimilarity > bestSimilarity) {
          bestSimilarity = altSimilarity;
          bestMatch = bank;
        }
      }
    }

    if (bestMatch && bestSimilarity >= FUZZY_THRESHOLD) {
      return {
        originalName: bankName,
        normalizedName: bestMatch.name,
        bankId: bestMatch.id,
        confidence: bestSimilarity,
        matchType: 'fuzzy',
      };
    }

    // 4. No se encontró coincidencia
    return {
      originalName: bankName,
      normalizedName: '',
      bankId: -1,
      confidence: 0,
      matchType: 'none',
    };
  };

  /**
   * Normaliza un array de nombres de bancos
   */
  const normalizeBankNames = (bankNames: string[]): NormalizedBank[] => {
    return bankNames.map((name) => findBank(name));
  };

  /**
   * Busca bancos por término de búsqueda (para autocompletado)
   */
  const searchBanks = (searchTerm: string, limit: number = 10): Bank[] => {
    if (!searchTerm || searchTerm.trim() === '') {
      return activeBanks.slice(0, limit);
    }

    const normalizedSearch = normalizeString(searchTerm);
    const results: Array<{ bank: Bank; score: number }> = [];

    for (const bank of activeBanks) {
      // Calcular similitud con nombre principal
      const nameScore = jaroWinklerSimilarity(normalizedSearch, normalizeString(bank.name));

      // Calcular similitud con nombres alternativos
      let maxAltScore = 0;
      for (const altName of bank.alternativeName || []) {
        const altScore = jaroWinklerSimilarity(normalizedSearch, normalizeString(altName));
        maxAltScore = Math.max(maxAltScore, altScore);
      }

      // Usar el mejor score
      const finalScore = Math.max(nameScore, maxAltScore);

      // Solo incluir si tiene al menos 50% de similitud
      if (finalScore >= 50) {
        results.push({ bank, score: finalScore });
      }
    }

    // Ordenar por score descendente
    results.sort((a, b) => b.score - a.score);

    // Retornar los mejores resultados
    return results.slice(0, limit).map((r) => r.bank);
  };

  return {
    banks,
    activeBanks,
    findBank,
    normalizeBankNames,
    searchBanks,
    isLoading,
    error,
  };
}
