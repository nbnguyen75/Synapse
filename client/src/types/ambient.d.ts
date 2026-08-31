type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type ArrayElement<ArrayType extends ReadonlyArray<unknown>> =
  ArrayType extends ReadonlyArray<infer ElementType> ? ElementType : never;
