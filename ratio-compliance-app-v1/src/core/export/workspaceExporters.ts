import type { LoadedWeekCollection } from '../week/types';

export function exportWorkspaceJson(collection: LoadedWeekCollection): string {
  return JSON.stringify(
    {
      schema: 'ratio-compliance-workspace/v1',
      exportedAt: new Date().toISOString(),
      workspace: collection,
    },
    null,
    2,
  );
}

export function importWorkspaceJson(json: string): LoadedWeekCollection {
  const parsed = JSON.parse(json);

  if (parsed.schema === 'ratio-compliance-workspace/v1' && parsed.workspace) {
    return parsed.workspace;
  }

  // Basic validation if schema is missing
  if (Array.isArray(parsed.weeks)) {
    return parsed as LoadedWeekCollection;
  }

  throw new Error('Invalid workspace JSON');
}
