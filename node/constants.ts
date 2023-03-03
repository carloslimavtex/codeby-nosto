import { appIdToAppAtMajor } from '@vtex/api';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const VTEX_APP_ID = process.env.VTEX_APP_ID!;

export const VTEX_APP_AT_MAJOR = appIdToAppAtMajor(VTEX_APP_ID);

export const APP_ID = 'codeby.nosto';

export const EVENT_NEXT_CALL_EXTRA_TIME_IN_MINUTES = 5;
