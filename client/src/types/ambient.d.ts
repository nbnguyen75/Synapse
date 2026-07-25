type Prettify<T> = {
   [K in keyof T]: T[K];
} & {};

type ArrayElement<ArrayType extends readonly unknown[]> =
   ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
