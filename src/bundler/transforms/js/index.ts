import * as babel from "@babel/standalone";

import { ITranspilationResult } from "../types";
import { collectDependencies } from "./dep-collector";

export async function transform(code: string): Promise<ITranspilationResult> {
  const requires: Set<string> = new Set();
  const transformed = babel.transform(code, {
    presets: ["env", "react"],
    plugins: [collectDependencies(requires)],
    ast: true,
  });

  return {
    code: transformed.code,
    dependencies: Array.from(requires),
  };
}