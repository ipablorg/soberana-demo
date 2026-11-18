import { useState, useEffect } from 'react';
import { computeSriHash, isSriSupported, getElementsSriHash } from '../utils/sri-utils';

export function useSriHash(content: string) {
  const configuredHash = getElementsSriHash();
  const [hash, setHash] = useState<string>(configuredHash);
  const [isComputing, setIsComputing] = useState(false);
  const supported = isSriSupported();

  useEffect(() => {
    if (!content || !supported) {
      setHash(configuredHash);
      return;
    }
    setIsComputing(true);
    computeSriHash(content).then(h => {
      setHash(h || configuredHash);
      setIsComputing(false);
    });
  }, [content, supported, configuredHash]);

  return { hash, isComputing, supported };
}
