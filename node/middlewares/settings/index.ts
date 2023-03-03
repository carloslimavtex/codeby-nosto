import { VTEX_APP_AT_MAJOR } from '../../constants';
import isValidDomain from 'is-valid-domain';
import { consoleWarn } from '../../utils/console';
import { SCHEDULES } from '../scheduler/schedules';

export interface Settings {
  appKey?: string;
  apiKey?: string;
  domain?: string;
  currency?: string;
  workspace?: string;
  targetWorkspace?: string;
}

export default async function settings(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { nosto },
    vtex: { workspace },
  } = ctx;

  const {
    apiKey,
    domain,
    currency,
    workspace: originalWorkspace,
    targetWorkspace: originalTargetWorkspace,
  } = await getSettings(ctx);

  const rejectExecution = () => deleteSchedules(ctx);

  if (!apiKey) {
    consoleWarn({
      message: 'ApiKey not defined!',
    });
    return rejectExecution();
  }

  if (!domain) {
    consoleWarn({
      message: 'domain not defined!',
    });
    return rejectExecution();
  }

  if (!isValidDomain(domain)) {
    consoleWarn({
      message: 'domain is invalid!',
      domain,
    });
    return rejectExecution();
  }

  if (!currency) {
    consoleWarn({
      message: 'currency not defined!',
    });
    return rejectExecution();
  }

  const allowedWorkspace = workspaceOrMaster(originalWorkspace);

  if (allowedWorkspace !== workspace) {
    consoleWarn({
      message: `current workspace(${workspace}) is not allowed to update backend`,
    });
    return rejectExecution();
  }

  nosto.apiKey = apiKey;
  nosto.domain = domain;
  nosto.currency = currency;
  nosto.targetWorkspace = workspaceOrMaster(originalTargetWorkspace);

  await next();
}

export function getSettings(ctx: Context) {
  const {
    clients: { apps },
  } = ctx;

  return apps.getAppSettings(VTEX_APP_AT_MAJOR) as Promise<Settings>;
}

function workspaceOrMaster(workspace?: string): string {
  return workspace || 'master';
}

async function deleteSchedules({ clients: { scheduler } }: Context): Promise<void> {
  await Promise.all(SCHEDULES.map(({ id }) => scheduler.delete(id)));
}
