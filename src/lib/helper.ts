export type GetArrTypeUnion<T extends any[]> = T extends (infer I)[] ? I : never;
