import { assertEquals } from 'std/assert/assert_equals.ts';
import { parseArguments } from './main.ts';

Deno.test('parseArguments should correctly parse CLI arguments', () => {
  const tests: { input: string[]; expected: ReturnType<typeof parseArguments> }[] = [
    {
      input: [
        '-h',
      ],
      expected: {
        apiKey: undefined,
        help: true,
        version: false,
        lockExpirationInSeconds: undefined,
        params: [],
        serverUrl: undefined,
        serviceId: undefined,
        unlockWebhookUrl: undefined,
        waitTimeoutInMs: undefined,
      },
    },
    {
      input: [
        `-i=service`,
        `-a=key`,
        `-s=url`,
      ],
      expected: {
        apiKey: 'key',
        help: false,
        version: false,
        lockExpirationInSeconds: undefined,
        params: [],
        serverUrl: 'url',
        serviceId: 'service',
        unlockWebhookUrl: undefined,
        waitTimeoutInMs: undefined,
      },
    },
    {
      input: [
        `-u=unlock`,
        `-w=wait`,
        `-l=lock`,
      ],
      expected: {
        apiKey: undefined,
        help: false,
        version: false,
        lockExpirationInSeconds: undefined,
        params: [],
        serverUrl: undefined,
        serviceId: undefined,
        unlockWebhookUrl: 'unlock',
        waitTimeoutInMs: undefined,
      },
    },
  ];

  for (const test of tests) {
    const output = parseArguments(test.input);
    assertEquals(output, test.expected);
  }
});
