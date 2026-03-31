import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createEventBus, type BocamEvent } from '../../src/index';

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
process.env.RABBITMQ_URL = rabbitUrl;

const originalLog = console.log;
const capturedLogs: string[] = [];

console.log = (...args: unknown[]) => {
  const line = args.map((value) => typeof value === 'string' ? value : JSON.stringify(value)).join(' ');
  capturedLogs.push(line);
  originalLog(...args);
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForEvent<T>(promiseFactory: () => Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promiseFactory(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout esperando evento RabbitMQ (${timeoutMs}ms).`)), timeoutMs);
    }),
  ]);
}

async function main() {
  const runId = randomUUID();
  const eventType = `integration.rabbitmq.${runId}`;
  const expectedCorrelationId = `corr-${randomUUID()}`;

  const publisher = createEventBus(`publisher-${runId}`);
  const consumer = createEventBus(`consumer-${runId}`);

  let resolveEvent: ((event: BocamEvent) => void) | undefined;
  const receivedEvent = new Promise<BocamEvent>((resolve) => {
    resolveEvent = resolve;
  });

  try {
    await publisher.connect();
    await consumer.connect();

    await consumer.subscribe(eventType, async (event) => {
      console.log(JSON.stringify({
        action: 'handler.received',
        event_type: event.event_type,
        correlation_id: event.context.correlation_id,
      }));

      resolveEvent?.(event);
    });

    await delay(250);

    const published = await publisher.publish({
      event_type: eventType,
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: randomUUID(),
        proyecto_id: randomUUID(),
        user_id: randomUUID(),
        correlation_id: expectedCorrelationId,
      },
      payload: {
        source: 'rabbitmq.integration.test',
      },
    });

    assert.equal(published, true, 'El evento no se publico correctamente en RabbitMQ.');

    const event = await waitForEvent(() => receivedEvent, 10000);

    assert.equal(event.context.correlation_id, expectedCorrelationId);
    assert.ok(
      capturedLogs.some((line) =>
        line.includes('"action":"handler.received"') &&
        line.includes(`"correlation_id":"${expectedCorrelationId}"`)
      ),
      'El correlation_id no aparecio en el log del handler.'
    );

    console.log('ok - event-bus propaga correlation_id hasta el handler RabbitMQ');
  } finally {
    await publisher.close();
    await consumer.close();
    console.log = originalLog;
  }
}

void main().catch((error) => {
  console.error('not ok - event-bus rabbitmq integration');
  console.error(error);
  console.log = originalLog;
  process.exitCode = 1;
});
