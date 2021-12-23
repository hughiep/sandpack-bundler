import { sortObj } from "../../utils/object";
import { filterBuildDeps } from "./build-dep";
import { fetchManifest, fetchModule } from "./module-cdn";
import { NodeModule } from "./NodeModule";

// dependency => version range
export type DepMap = { [depName: string]: string };

export class ModuleRegistry {
  modules: Map<string, NodeModule> = new Map();

  async fetchNodeModules(
    deps: DepMap,
    shouldFilterBuildDeps = true
  ): Promise<void> {
    if (shouldFilterBuildDeps) {
      deps = filterBuildDeps(deps);
    }

    const sortedDeps = sortObj(deps);
    const dependencies = await fetchManifest(sortedDeps);
    // TODO: Use priority queue with the depth
    await Promise.all(
      dependencies.map((d) => {
        this.fetchNodeModule(d.n, d.v);
      })
    );
  }

  async fetchNodeModule(name: string, version: string): Promise<void> {
    const module = await fetchModule(name, version);
    this.modules.set(name, new NodeModule(name, version, module.f, module.m));
  }
}
