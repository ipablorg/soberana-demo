import { useMemo } from 'react';
import type { WidgetConfig, IntegrationSnippet, SnippetFramework, HeadlessSnippetFramework } from '../types';
import {
  reactSnippet,
  vueSnippet,
  vanillaSnippet,
  webComponentSnippet,
  reactHeadlessSnippet,
  vueHeadlessSnippet,
  vanillaHeadlessSnippet,
  nodeWebhookSnippet,
} from '../utils/snippet-templates';
import { getElementsCdnUrl, getElementsSriHash, SDK_VERSION } from '../utils/sri-utils';

export function useSnippetGenerator(config: WidgetConfig | null) {
  const snippets = useMemo<Record<SnippetFramework, IntegrationSnippet> | null>(() => {
    if (!config) return null;

    const cdnUrl = getElementsCdnUrl();
    const sriHash = getElementsSriHash();

    const base: Omit<IntegrationSnippet, 'framework' | 'code'> = {
      widgetId: config.id,
      widgetType: config.type,
      sriHash: sriHash || undefined,
      cdnUrl,
      version: SDK_VERSION,
      generatedAt: new Date().toISOString(),
    };

    return {
      react: { ...base, framework: 'react', code: reactSnippet(config) },
      vue: { ...base, framework: 'vue', code: vueSnippet(config) },
      vanilla: { ...base, framework: 'vanilla', code: vanillaSnippet(config, sriHash) },
      'web-component': { ...base, framework: 'web-component', code: webComponentSnippet(config, sriHash) },
    };
  }, [config]);

  const headlessSnippets = useMemo<Record<HeadlessSnippetFramework, IntegrationSnippet> | null>(() => {
    if (!config || config.deliveryMode !== 'headless') return null;

    const base: Omit<IntegrationSnippet, 'framework' | 'code'> = {
      widgetId: config.id,
      widgetType: config.type,
      cdnUrl: getElementsCdnUrl(),
      version: SDK_VERSION,
      generatedAt: new Date().toISOString(),
    };

    return {
      'react-headless': { ...base, framework: 'react-headless', code: reactHeadlessSnippet(config) },
      'vue-headless': { ...base, framework: 'vue-headless', code: vueHeadlessSnippet(config) },
      'vanilla-headless': { ...base, framework: 'vanilla-headless', code: vanillaHeadlessSnippet(config) },
      'node-webhook': { ...base, framework: 'node-webhook', code: nodeWebhookSnippet(config) },
    };
  }, [config]);

  return { snippets, headlessSnippets };
}
