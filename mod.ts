export interface ConstructorOptions {
  apiKey: string;
  serverUrl?: string;
}

interface LockActionOptions {
  /** a URL which will receive a POST event (with `{ "lockName": "<lock name>" }` in the body) when the lock becomes unlocked */
  unlockWebhookUrl?: string;
  waitTimeoutInMs?: number;
  /** a number of milliseconds after which the lock will automatically expire */
  lockExpirationInMs?: number;
}
interface UnlockActionOptions {
  waitTimeoutInMs?: number;
}
interface CheckActionOptions {
  waitTimeoutInMs?: number;
}

type ClientLockEventData = {
  eventName: 'lock';
  lockName: string;
} & Pick<LockActionOptions, 'unlockWebhookUrl' | 'lockExpirationInMs'>;
type ClientUnlockEventData = {
  eventName: 'unlock';
  lockName: string;
};
type ClientCheckEventData = {
  eventName: 'check';
  lockName: string;
};

interface ServerLockEventData {
  eventName: 'lock';
  lockName: string;
  wasLocked: boolean;
}
interface ServerUnlockEventData {
  eventName: 'unlock';
  lockName: string;
  wasLocked: boolean;
}
interface ServerCheckEventData {
  eventName: 'check';
  lockName: string;
  isLocked: boolean;
}

export type ClientSentEventData = ClientLockEventData | ClientUnlockEventData | ClientCheckEventData;
export type ServerSentEventData = ServerLockEventData | ServerUnlockEventData | ServerCheckEventData;

interface CallServerOptions {
  callTimeoutInMs?: number;
}

const defaultServerUrl = 'https://api.lockdb.com';

export default class LockDB {
  protected serviceId: string;
  protected apiKey: string;
  protected serverUrl: string;

  constructor(serviceId: string, options: ConstructorOptions) {
    this.serviceId = serviceId;
    this.apiKey = options.apiKey;
    this.serverUrl = options.serverUrl || defaultServerUrl;
  }

  protected async callServer<T = ServerSentEventData>(
    data: ClientSentEventData,
    { callTimeoutInMs = 5000 }: CallServerOptions = {},
  ): Promise<T> {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const body = {
      serviceId: this.serviceId,
      ...data,
    };

    const response = await fetch(`${this.serverUrl}/${data.eventName}`, {
      signal: AbortSignal.timeout(callTimeoutInMs),
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    const result = (await response.json()) as T;

    return result;
  }

  public async lock(
    name: string,
    { unlockWebhookUrl, waitTimeoutInMs = 5_000, lockExpirationInMs = 300_000 }: LockActionOptions = {},
  ): Promise<boolean> {
    const data: ClientLockEventData = { eventName: 'lock', lockName: name, unlockWebhookUrl, lockExpirationInMs };

    const result = await this.callServer<ServerLockEventData>(data, { callTimeoutInMs: waitTimeoutInMs });

    return Boolean(result.wasLocked);
  }

  public async unlock(
    name: string,
    { waitTimeoutInMs = 5_000 }: UnlockActionOptions = {},
  ): Promise<boolean> {
    const data: ClientUnlockEventData = { eventName: 'unlock', lockName: name };

    const result = await this.callServer<ServerUnlockEventData>(data, { callTimeoutInMs: waitTimeoutInMs });

    return Boolean(result.wasLocked);
  }

  public async check(name: string, { waitTimeoutInMs = 5_000 }: CheckActionOptions = {}): Promise<boolean> {
    const data: ClientCheckEventData = { eventName: 'check', lockName: name };

    const result = await this.callServer<ServerCheckEventData>(data, { callTimeoutInMs: waitTimeoutInMs });

    return Boolean(result.isLocked);
  }
}
