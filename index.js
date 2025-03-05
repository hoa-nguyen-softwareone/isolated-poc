const ivm = require("isolated-vm");

async function run() {
  let isolate = new ivm.Isolate({ memoryLimit: 128 });
  let context = await isolate.createContext();
  let jail = context.global;
  await jail.set("global", jail.derefInto());

  // Function to fetch URL from main thread
  async function fetchUrl(url) {
    const response = await fetch(url);
    return await response.text();
  }

  // Give isolate access to fetchUrl
  await jail.set("fetchUrl", new ivm.Reference(fetchUrl));

  let script = await isolate.compileScript(`
        async function crawl() {
            let data = await fetchUrl.deref()("https://dummyjson.com/test");
            return data.slice(0, 100); // Just for testing
        }
        crawl();
    `);

  let result = await script.run(context);
  console.log("Crawled data:", result);
}

run();
