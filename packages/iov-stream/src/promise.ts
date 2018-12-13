import { Producer, Stream } from "xstream";

/**
 * Emits one event for each list element as soon as the promise resolves
 */
export function fromListPromise<T>(promise: Promise<Iterable<T>>): Stream<T> {
  const producer: Producer<T> = {
    start: listener => {
      // the code in `start` runs as soon as anyone listens to the stream
      promise
        .then(iterable => {
          for (const element of iterable) {
            listener.next(element);
          }
          listener.complete();
        })
        .catch(error => listener.error(error));
    },
    // tslint:disable:no-empty
    stop: () => {},
  };

  return Stream.create(producer);
}

/**
 * Listens to stream and collects events. When `count` events are collected,
 * the promise resolves with an array of events.
 *
 * Rejects of stream completes before `count` events are collected.
 */
export function toListPromise<T>(stream: Stream<T>, count: number): Promise<ReadonlyArray<T>> {
  return new Promise<ReadonlyArray<T>>((resolve, reject) => {
    if (count === 0) {
      resolve([]);
      return;
    }

    const events = new Array<T>();
    // take() unsubscribes from source stream automatically
    stream.take(count).subscribe({
      next: event => {
        events.push(event);

        if (events.length === count) {
          resolve(events);
        }
      },
      complete: () => {
        reject(
          `Stream completed before all events could be collected. ` +
            `Collected ${events.length}, expected ${count}`,
        );
      },
      error: error => reject(error),
    });
  });
}
