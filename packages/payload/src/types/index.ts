import type { I18n, TFunction } from '@payloadcms/translations'
import type DataLoader from 'dataloader'
import type { OptionalKeys, RequiredKeys } from 'ts-essentials'
import type { URL } from 'url'

import type {
  DataFromCollectionSlug,
  QueryDraftDataFromCollectionSlug,
  TypeWithID,
  TypeWithTimestamps,
} from '../collections/config/types.js'
import type payload from '../index.js'
import type {
  CollectionSlug,
  DataFromGlobalSlug,
  GlobalSlug,
  Payload,
  PayloadTypes,
  RequestContext,
  TypedCollectionJoins,
  TypedCollectionSelect,
  TypedFallbackLocale,
  TypedLocale,
  TypedUser,
} from '../index.js'
import type { Operator } from './constants.js'
export type { Payload } from '../index.js'

export type CustomPayloadRequestProperties = {
  context: RequestContext
  /** The locale that should be used for a field when it is not translated to the requested locale */
  fallbackLocale?: TypedFallbackLocale
  i18n: I18n
  /**
   * The requested locale if specified
   * Only available for localized collections
   *
   * Suppressing warning below as it is a valid use case - won't be an issue if generated types exist
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  locale?: 'all' | TypedLocale
  /**
   * The payload object
   */
  payload: typeof payload
  /**
   * The context in which the request is being made
   */
  payloadAPI: 'GraphQL' | 'local' | 'REST'
  /** Optimized document loader */
  payloadDataLoader: {
    /**
     * Wraps `payload.find` with a cache to deduplicate requests
     * @experimental This is may be replaced by a more robust cache strategy in future versions
     * By calling this method with the same arguments many times in one request, it will only be handled one time
     * const result = await req.payloadDataLoader.find({
     *  collection,
     *  req,
     *  where: findWhere,
     * })
     */
    find: Payload['find']
  } & DataLoader<string, TypeWithID>
  /** Resized versions of the image that was uploaded during this request */
  payloadUploadSizes?: Record<string, Buffer>
  /** Query params on the request */
  query: Record<string, unknown>
  /** Any response headers that are required to be set when a response is sent */
  responseHeaders?: Headers
  /** The route parameters
   * @example
   * /:collection/:id -> /posts/123
   * { collection: 'posts', id: '123' }
   */
  routeParams?: Record<string, unknown>
  /** Translate function - duplicate of i18n.t */
  t: TFunction
  /**
   * Identifier for the database transaction for interactions in a single, all-or-nothing operation.
   * Can also be used to ensure consistency when multiple operations try to create a transaction concurrently on the same request.
   */
  transactionID?: number | Promise<number | string> | string
  /**
   * Used to ensure consistency when multiple operations try to create a transaction concurrently on the same request
   * @deprecated This is not used anywhere, instead `transactionID` is used for the above. Will be removed in next major version.
   */
  transactionIDPromise?: Promise<void>
  /** The signed-in user */
  user: null | TypedUser
} & Pick<
  URL,
  'hash' | 'host' | 'href' | 'origin' | 'pathname' | 'port' | 'protocol' | 'search' | 'searchParams'
>
type PayloadRequestData = {
  /**
   * Data from the request body
   *
   * Within Payload operations, i.e. hooks, data will be there
   * BUT in custom endpoints it will not be, you will need to
   * use either:
   *  1. `const data = await req.json()`
   *
   *  2. import { addDataAndFileToRequest } from 'payload'
   *    `await addDataAndFileToRequest(req)`
   *
   * You should not expect this object to be the document data. It is the request data.
   * */
  data?: JsonObject
  /** The file on the request, same rules apply as the `data` property */
  file?: {
    /**
     * Context of the file when it was uploaded via client side.
     */
    clientUploadContext?: unknown
    data: Buffer
    mimetype: string
    name: string
    size: number
    tempFilePath?: string
  }
}
export interface PayloadRequest
  extends CustomPayloadRequestProperties,
    Partial<Request>,
    PayloadRequestData {
  headers: Request['headers']
}

export type { Operator }

// Makes it so things like passing new Date() will error
export type JsonValue = JsonArray | JsonObject | unknown //Date | JsonArray | JsonObject | boolean | null | number | string // TODO: Evaluate proper, strong type for this

export type JsonArray = Array<JsonValue>

export interface JsonObject {
  [key: string]: any
}

export type WhereField = {
  // any json-serializable value
  [key in Operator]?: JsonValue
}

export type Where = {
  [key: string]: Where[] | WhereField
  // @ts-expect-error - vestiges of when tsconfig was not strict. Feel free to improve
  and?: Where[]
  // @ts-expect-error - vestiges of when tsconfig was not strict. Feel free to improve
  or?: Where[]
}

export type Sort = Array<string> | string

type SerializableValue = boolean | number | object | string
export type DefaultValue =
  | ((args: {
      locale?: TypedLocale
      req: PayloadRequest
      user: PayloadRequest['user']
    }) => SerializableValue)
  | SerializableValue

/**
 * Applies pagination for join fields for including collection relationships
 */
export type JoinQuery<TSlug extends CollectionSlug = string> =
  TypedCollectionJoins[TSlug] extends Record<string, string>
    ?
        | false
        | Partial<{
            [K in keyof TypedCollectionJoins[TSlug]]:
              | {
                  count?: boolean
                  limit?: number
                  page?: number
                  sort?: string
                  where?: Where
                }
              | false
          }>
    : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Document = any

export type Operation = 'create' | 'delete' | 'read' | 'update'
export type VersionOperations = 'readVersions'
export type AuthOperations = 'unlock'
export type AllOperations = AuthOperations | Operation | VersionOperations

export function docHasTimestamps(doc: any): doc is TypeWithTimestamps {
  return doc?.createdAt && doc?.updatedAt
}

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N // This is a commonly used trick to detect 'any'
export type IsAny<T> = IfAny<T, true, false>
export type ReplaceAny<T, DefaultType> = IsAny<T> extends true ? DefaultType : T

export type SelectIncludeType = {
  [k: string]: SelectIncludeType | true
}

export type SelectExcludeType = {
  [k: string]: false | SelectExcludeType
}

export type SelectMode = 'exclude' | 'include'

export type SelectType = SelectExcludeType | SelectIncludeType

export type ApplyDisableErrors<T, DisableErrors = false> = false extends DisableErrors
  ? T
  : null | T

export type TransformDataWithSelect<
  Data extends Record<string, any>,
  Select extends SelectType,
> = Select extends never
  ? Data
  : string extends keyof Select
    ? Data
    : // START Handle types when they aren't generated
      // For example in any package in this repository outside of tests / plugins
      // This stil gives us autocomplete when using include select mode, i.e select: {title :true} returns type {title: any, id: string | number}
      string extends keyof Omit<Data, 'id'>
      ? Select extends SelectIncludeType
        ? {
            [K in Data extends TypeWithID ? 'id' | keyof Select : keyof Select]: K extends 'id'
              ? number | string
              : unknown
          }
        : Data
      : // END Handle types when they aren't generated
        // Handle include mode
        Select extends SelectIncludeType
        ? {
            [K in keyof Data as K extends keyof Select
              ? Select[K] extends object | true
                ? K
                : never
              : // select 'id' always
                K extends 'id'
                ? K
                : never]: Data[K]
          }
        : // Handle exclude mode
          {
            [K in keyof Data as K extends keyof Select
              ? Select[K] extends object | undefined
                ? K
                : never
              : K]: Data[K]
          }

export type TransformCollectionWithSelect<
  TSlug extends CollectionSlug,
  TSelect extends SelectType,
> = TSelect extends SelectType
  ? TransformDataWithSelect<DataFromCollectionSlug<TSlug>, TSelect>
  : DataFromCollectionSlug<TSlug>

export type DraftTransformCollectionWithSelect<
  TSlug extends CollectionSlug,
  TSelect extends SelectType,
> = TSelect extends SelectType
  ? TransformDataWithSelect<QueryDraftDataFromCollectionSlug<TSlug>, TSelect>
  : QueryDraftDataFromCollectionSlug<TSlug>

export type TransformGlobalWithSelect<
  TSlug extends GlobalSlug,
  TSelect extends SelectType,
> = TSelect extends SelectType
  ? TransformDataWithSelect<DataFromGlobalSlug<TSlug>, TSelect>
  : DataFromGlobalSlug<TSlug>

export type PopulateType = Partial<TypedCollectionSelect>

export type ResolvedFilterOptions = { [collection: string]: Where }

export type PickPreserveOptional<T, K extends keyof T> = Partial<
  Pick<T, Extract<K, OptionalKeys<T>>>
> &
  Pick<T, Extract<K, RequiredKeys<T>>>

export type MaybePromise<T> = Promise<T> | T

// ─── Depth-Aware Relationship Types ─────────────────────────────────────────
// When `typescript.typeSafeDepth` is enabled in the Payload config, these utilities
// provide compile-time type safety for relationship fields based on the `depth` parameter.

/**
 * Valid depth values for type-safe depth queries (0 through 10, matching Payload's maxDepth).
 */
export type AllowedDepth = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * Default depth type. When `typeSafeDepth` is enabled, defaults to the config's `defaultDepth` (typically 2).
 * When not enabled, resolves to `number` which disables depth-based type narrowing.
 */
export type DefaultDepth = PayloadTypes extends { typeSafeDepth: true } ? 2 : number

/**
 * Decrements a depth value by 1 using a tuple lookup.
 * - `DecrementDepth<3>` → `2`
 * - `DecrementDepth<0>` → `never`
 * - `DecrementDepth<number>` → `number` (passthrough for non-literal depth)
 */
export type DecrementDepth<D extends AllowedDepth | number> = number extends D
  ? number
  : D extends AllowedDepth
    ? [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9][D]
    : never

/**
 * Brand interface used to mark generated collection types when `typeSafeDepth` is enabled.
 * The `__collection` property identifies the collection slug for depth-aware type resolution.
 */
export interface CollectionBrand<TSlug extends string = string> {
  __collection?: TSlug
}

/**
 * Extracts the ID type for a given collection slug.
 */
type CollectionIDType<TSlug extends string> = TSlug extends CollectionSlug
  ? DataFromCollectionSlug<TSlug>['id']
  : number | string

/**
 * Core recursive type that transforms relationship fields based on depth.
 *
 * At depth 0: branded collection types resolve to their ID type.
 * At depth > 0: branded collection types resolve to the populated object with depth decremented.
 * When depth is `number` (non-literal): returns the type unchanged (backwards-compatible union).
 *
 * The recursion works by:
 * 1. Checking if a property value is branded with `__collection`
 * 2. If so, replacing it with either the ID or the recursively depth-applied type
 * 3. Handling arrays, nullables, polymorphic relationships, and nested objects
 */
export type ApplyDepth<T, D extends AllowedDepth | number> =
  // When depth is a non-literal number, pass through unchanged (backwards-compatible)
  number extends D
    ? T
    : // Handle arrays
      T extends (infer U)[]
      ? ApplyDepth<U, D>[]
      : // Handle null unions
        T extends null
        ? null
        : // Handle branded collection types (relationship fields)
          T extends CollectionBrand<infer TSlug>
          ? D extends 0
            ? CollectionIDType<TSlug>
            : D extends AllowedDepth
              ? ApplyDepthToObject<Omit<T, '__collection'>, DecrementDepth<D>>
              : T
          : // Handle plain objects recursively (for groups, tabs, blocks, etc.)
            T extends object
            ? ApplyDepthToObject<T, D>
            : T

/**
 * Applies depth transformation to all properties of an object type.
 */
type ApplyDepthToObject<T, D extends AllowedDepth | number> = {
  [K in keyof T]: ApplyDepth<T[K], D>
}

/**
 * Applies depth transformation to an API result type (top-level).
 * Unlike `ApplyDepth`, this never resolves the top-level object itself to an ID —
 * it always treats it as an object and applies depth to its properties.
 * The `__collection` brand is stripped from the top-level result.
 *
 * This is the correct entry point for all Local API return types.
 */
export type ApplyDepthToResult<T, D extends AllowedDepth | number> = number extends D
  ? T
  : T extends object
    ? { [K in keyof T as K extends '__collection' ? never : K]: ApplyDepth<T[K], D> }
    : T

/**
 * Convenience wrapper that applies depth to a collection result type.
 * Used in local API return types to transform results based on the depth parameter.
 *
 * When `typeSafeDepth` is not enabled, `DefaultDepth` is `number`, so `ApplyDepthToResult` passes through unchanged.
 */
export type ApplyDepthToCollection<
  TSlug extends CollectionSlug,
  TSelect extends SelectType,
  TDepth extends AllowedDepth | number = DefaultDepth,
> = ApplyDepthToResult<TransformCollectionWithSelect<TSlug, TSelect>, TDepth>

/**
 * Convenience wrapper that applies depth to a global result type.
 */
export type ApplyDepthToGlobal<
  TSlug extends GlobalSlug,
  TSelect extends SelectType,
  TDepth extends AllowedDepth | number = DefaultDepth,
> = ApplyDepthToResult<TransformGlobalWithSelect<TSlug, TSelect>, TDepth>
