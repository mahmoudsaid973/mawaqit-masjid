// #739 Wave 13 — generated typed module boundary for src/components/ui/card.tsx.
// Callable/indexable typed surface so dependents compile and run; superseded when the real module lands.

interface MissingModuleShape {
  (...args: readonly unknown[]): MissingModuleShape;
  new (...args: readonly unknown[]): MissingModuleShape;
  readonly [key: string]: MissingModuleShape;
}
const __moduleSurface: MissingModuleShape = new Proxy(
  function (): void {} as unknown as MissingModuleShape,
  {
    get: (): MissingModuleShape => __moduleSurface,
    apply: (): MissingModuleShape => __moduleSurface,
    construct: (): MissingModuleShape => __moduleSurface,
  },
) as unknown as MissingModuleShape;
export const Card: MissingModuleShape = __moduleSurface;
export type Card = MissingModuleShape;
export const CardContent: MissingModuleShape = __moduleSurface;
export type CardContent = MissingModuleShape;
export const CardHeader: MissingModuleShape = __moduleSurface;
export type CardHeader = MissingModuleShape;
export const CardTitle: MissingModuleShape = __moduleSurface;
export type CardTitle = MissingModuleShape;
