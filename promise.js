// const ivm = require("isolated-vm");

// const code1 = () => `(async () => {
//   log('hello')
//   await wait(2)
//   log('world')
// })()`;

// const code2 = () => `log('should have waited')`;

// const logCallback = function (...args) {
//   console.log(...args);
// };

// (async () => {
//   const isolate = new ivm.Isolate({ memoryLimit: 2048 });
//   const context = await isolate.createContext();
//   const jail = context.global;
//   jail.setSync("global", jail.derefInto());
//   await context.evalClosure(
//     `global.log = function(...args) {
//     $0.applyIgnored(undefined, args, { arguments: { copy: true } });
//   }`,
//     [logCallback],
//     { arguments: { reference: true } }
//   );

//   await context.evalClosure(
//     `global.wait = (...args) => {
//       return $0.applySync(undefined, args, { arguments: { copy: true }, result: { promise: true, copy: true } });
//     }`,
//     [(seconds) => new Promise((r) => setTimeout(r, seconds * 1000))],
//     { arguments: { reference: true } }
//   );

//   try {
//     await await context.eval(code1(), { promise: true });
//     await await context.eval(code2(), { promise: true });
//   } catch (err) {
//     console.log("JS execution - %s", err);
//   } finally {
//     context.release();
//   }
// })();

const ivm = require("isolated-vm");

const code1 = () => `(async () => {
  log('hello');
  await wait(2);
  log('world');
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
//   const data = await response.json();
  log('Fetched data:', response);
})()`;

const code2 = () => `log('should have waited')`;

const logCallback = function (...args) {
  console.log(...args);
};

(async () => {
  const isolate = new ivm.Isolate({ memoryLimit: 2048 });
  const context = await isolate.createContext();
  const jail = context.global;
  jail.setSync("global", jail.derefInto());

  // Expose log function
  await context.evalClosure(
    `global.log = function(...args) {
      $0.applyIgnored(undefined, args, { arguments: { copy: true } });
    }`,
    [logCallback],
    { arguments: { reference: true } }
  );

  // Expose wait function
  await context.evalClosure(
    `global.wait = (...args) => { 
      return $0.applySync(undefined, args, { arguments: { copy: true }, result: { promise: true, copy: true } });
    }`,
    [(seconds) => new Promise((r) => setTimeout(r, seconds * 1000))],
    { arguments: { reference: true } }
  );

  // Expose fetch function
  await context.evalClosure(
    `global.fetch = async (...args) => {
      return $0.apply(undefined, args, { arguments: { copy: true }, result: { promise: true, copy: true } });
    }`,
    [
      async (url) => {
        const response = await fetch(url);
        const data = await response.json();
        return data;
      },
    ],
    { arguments: { reference: true } }
  );

  try {
    await await context.eval(code1(), { promise: true });
    await await context.eval(code2(), { promise: true });
  } catch (err) {
    console.log("JS execution - %s", err);
  } finally {
    context.release();
  }
})();
