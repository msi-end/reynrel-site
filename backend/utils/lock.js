// Serialises read-modify-write cycles on the lowdb JSON file so concurrent
// requests (e.g. two withdrawal requests fired at once) can't both pass a
// balance check before either is written.
let chain = Promise.resolve();

export function withLock(fn) {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}
