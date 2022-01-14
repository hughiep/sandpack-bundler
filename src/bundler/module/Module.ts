import { Bundler } from "../bundler";
import { getTransformers } from "../transforms";
import { Evaluation } from "./Evaluation";

export interface IDependencyEvent {
  specifier: string;
}

export class Module {
  filepath: string;
  dependencies: Set<string>;
  // Keeping this seperate from dependencies as there might be duplicates otherwise
  dependencyMap: Map<string, string>;

  source: string;
  compiled: string | null;
  bundler: Bundler;
  evaluation: Evaluation | null = null;

  constructor(
    filepath: string,
    source: string,
    isCompiled: boolean = false,
    bundler: Bundler
  ) {
    this.filepath = filepath;
    this.source = source;
    this.compiled = isCompiled ? source : null;
    this.dependencies = new Set();
    this.dependencyMap = new Map();
    this.bundler = bundler;
  }

  /** Add dependency and emit event to queue transpilation of dep */
  async addDependency(depSpecifier: string): Promise<void> {
    const resolved = await this.bundler.resolveAsync(
      depSpecifier,
      this.filepath
    );
    this.dependencies.add(resolved);
    this.dependencyMap.set(depSpecifier, resolved);
  }

  async compile(): Promise<void> {
    if (this.compiled) {
      return;
    }

    const transformers = getTransformers();
    let input = this.source;
    for (const transformer of transformers) {
      const { code, dependencies } = await transformer({
        filepath: this.filepath,
        code: input,
      });
      input = code;
      await Promise.all(
        Array.from(dependencies).map((d) => this.addDependency(d))
      );
    }
    this.compiled = input;
  }

  evaluate(): Evaluation {
    if (this.evaluation) {
      return this.evaluation;
    }

    this.evaluation = new Evaluation(this);
    return this.evaluation;
  }
}