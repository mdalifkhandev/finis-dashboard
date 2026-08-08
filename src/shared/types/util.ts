/**
 * Utility Types
 * 
 * Reusable TypeScript utility types for common patterns.
 */

/**
 * Make specific properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type Required<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};

/**
 * Deep partial type
 */
export type DeepPartial<T> = T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
    }
    : T;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Maybe type
 */
export type Maybe<T> = T | null | undefined;

/**
 * Extract keys of specific type
 */
export type KeysOfType<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Branded type for type safety
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * ID types with brands
 */
export type ProjectId = Brand<string, 'ProjectId'>;
export type CompanyId = Brand<string, 'CompanyId'>;
export type WorkerId = Brand<string, 'WorkerId'>;
export type AdminId = Brand<string, 'AdminId'>;
export type ManagerId = Brand<string, 'ManagerId'>;

/**
 * Value of object
 */
export type ValueOf<T> = T[keyof T];

/**
 * Entries type
 */
export type Entries<T> = Array<
    {
        [K in keyof T]: [K, T[K]];
    }[keyof T]
>;

/**
 * Async function type
 */
export type AsyncFn<TArgs extends unknown[] = [], TReturn = void> = (
    ...args: TArgs
) => Promise<TReturn>;

/**
 * Event handler type
 */
export type EventHandler<T = void> = (event: T) => void;

/**
 * Callback type
 */
export type Callback<T = void> = () => T;

/**
 * Status union types
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Comparison function
 */
export type CompareFn<T> = (a: T, b: T) => number;

/**
 * Predicate function
 */
export type PredicateFn<T> = (value: T) => boolean;

/**
 * Mapper function
 */
export type MapperFn<TInput, TOutput> = (value: TInput) => TOutput;
