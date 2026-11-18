/**
 * Test harness of the tenant backoffice container tests.
 *
 * Tests mock `@/shared/lib/graphql-client` with `graphqlClient.request` bound
 * to `respond(handlers)`, which answers each document by its root field
 * (`tenant_me`, `tenant_listCustomers`, ...). Screens render inside a real
 * QueryClient (no retries) and a MemoryRouter.
 */

import { act, type ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { DocumentNode, OperationDefinitionNode } from 'graphql';

import { mountPage, type MountedPage } from '@/test/dom-render';

export type Handler = (variables: Record<string, unknown>) => unknown;

/** Root field selected by a single-operation document. */
export function rootFieldOf(document: DocumentNode): string {
  const operation = document.definitions[0] as OperationDefinitionNode;
  const [selection] = operation.selectionSet.selections;

  return selection && selection.kind === 'Field' ? selection.name.value : '';
}

/** `graphqlClient.request` stand-in: resolves (or rejects with) the handler result per root field. */
export function respond(handlers: Record<string, Handler>) {
  return async (document: DocumentNode, variables?: Record<string, unknown>) => {
    const field = rootFieldOf(document);
    const handler = handlers[field];
    if (!handler) throw new Error(`No mock for ${field}`);
    const result = await handler(variables ?? {});

    return { [field]: result };
  };
}

/** A GraphQL failure shaped like graphql-request's ClientError. */
export function graphQLError(errorCode: string, message = errorCode, code = 'BAD_REQUEST') {
  return Object.assign(new Error(message), {
    response: { errors: [{ message, extensions: { code, error_code: errorCode } }] },
  });
}

function LocationProbe() {
  return (
    <span data-testid="loc" hidden>
      {useLocation().pathname}
    </span>
  );
}

export function renderTenant(
  element: ReactElement,
  { path = '/', routePath = '*' }: { path?: string; routePath?: string } = {}
): MountedPage {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return mountPage(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <LocationProbe />
        <Routes>
          <Route path={routePath} element={element} />
          {routePath !== '*' ? <Route path="*" element={<div>other-route</div>} /> : null}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

/** Lets queries/mutations resolve until `done()` holds (or a few ticks pass). */
export async function settle(done: () => boolean = () => false): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    if (done()) return;
  }
}

export function currentPath(page: MountedPage): string | null | undefined {
  return page.container.querySelector('[data-testid="loc"]')?.textContent;
}
