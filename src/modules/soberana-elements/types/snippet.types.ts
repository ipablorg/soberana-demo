import type { WidgetType } from './widget.types';
import type { HeadlessSnippetFramework } from './sdk.types';

export type SnippetFramework =
  | 'react'
  | 'vue'
  | 'vanilla'
  | 'web-component';

export type { HeadlessSnippetFramework };

export interface IntegrationSnippet {
  framework: SnippetFramework | HeadlessSnippetFramework;
  widgetId: string;
  widgetType: WidgetType;
  code: string;
  sriHash?: string;
  cdnUrl: string;
  version: string;
  generatedAt: string;
}
