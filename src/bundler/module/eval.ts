/* eslint-disable no-eval */
// import buildProcess from "./utils/process";

const g = typeof window === "undefined" ? self : window;

const hasGlobalDeclaration = /^const global/m;

/* eslint-disable no-unused-vars */
export default function (
  code: string,
  require: Function,
  context: { exports: any },
  env: Object = {},
  globals: Object = {}
) {
  const global = g;
  // const process = buildProcess(env);
  // @ts-ignore
  g.global = global;

  const allGlobals: { [key: string]: any } = {
    require,
    module: context,
    exports: context.exports,
    // process,
    global,
    ...globals,
  };

  if (hasGlobalDeclaration.test(code)) {
    delete allGlobals.global;
  }

  const allGlobalKeys = Object.keys(allGlobals);
  const globalsCode = allGlobalKeys.length ? allGlobalKeys.join(", ") : "";
  const globalsValues = allGlobalKeys.map((k) => allGlobals[k]);
  try {
    const newCode =
      `(function $csb$eval(` + globalsCode + `) {` + code + `\n})`;
    // @ts-ignore
    (0, eval)(newCode).apply(allGlobals.global, globalsValues);

    return context.exports;
  } catch (e) {
    let error = e;
    if (typeof e === "string") {
      error = new Error(e);
    }
    // @ts-ignore
    error.isEvalError = true;

    throw error;
  }
}