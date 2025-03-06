// const ivm = require("isolated-vm");

// async function run() {
//   let isolate = new ivm.Isolate({ memoryLimit: 128 });
//   let context = await isolate.createContext();
//   let jail = context.global;
//   await jail.set("global", jail.derefInto());

//   // Function to fetch URL from main thread
//   async function fetchUrl() {
//     const response = await fetch("https://dummyjson.com/test");
//     const data = await response.json();

//     return data;
//   }

//   (async () => {
//     const response = await fetch("https://dummyjson.com/test");
//     const data = await response.json();
//     console.log("Data from main thread:", data);
//   })();

//   // Give isolate access to fetchUrl
//   //   await jail.set("fetchUrl", new ivm.Reference(fetchUrl));

//   // Give the isolate permission to call a function in the main thread
//   await jail.set(
//     "fetchUrl",
//     new ivm.Reference(async () => {
//       const data = await fetchUrl(); // Fetch in the main thread
//       return new ivm.ExternalCopy(data).copyInto(); // Transfer safely to the isolate
//     })
//   );

//   let script = await isolate.compileScript(`
//         async function crawl() {
//             let data = await fetchUrl.applySync();
//             return fetchUrl;
//         }

//         (async () => {
//             return await crawl();
//         }
//         )();

//     `);

//   let result = await script.run(context, { promise: true });
//   console.log("Crawled data:", result);
// }

// run();

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
