import { extendedPromise } from './promiseExecutor'
import { MaybePromise, Maybe } from './maybe'
import { pick, omit } from 'lodash'
import { ResultPromise } from './result'

/**
 * Returns type A if T is a plain object or B if not
 * it's a bit naive but should help
 */
type IfPlainObject<T, A, B> = T extends string
    ? B
    : T extends number
    ? B
    : T extends boolean
    ? B
    : T extends undefined
    ? B
    : T extends Function
    ? B
    : T extends Array<any>
    ? B
    : A

/**
 * Represents a promise for an array of values - values as opposed to objects
 */
export class ValueArrayPromise<T> extends Promise<T[]> {
    public static build<T>(promise: Promise<T[]>): ValueArrayPromise<T> {
        return extendedPromise(ValueArrayPromise, promise)
    }

    public count(): Promise<number> {
        return this.then((values) => values.length)
    }

    public first(): MaybePromise<T> {
        return MaybePromise.from(this.then((values) => Maybe.fromOptional(values[0])))
    }

    public filter(fn: (row: T) => boolean): IfPlainObject<T, ObjectArrayPromise<T>, ValueArrayPromise<T>> {
        return ObjectArrayPromise.build(this.then((values) => values.filter(fn)))
    }

    public map<K>(fn: (row: T) => K): IfPlainObject<K, ObjectArrayPromise<K>, ValueArrayPromise<K>> {
        return ObjectArrayPromise.build(this.then((values) => values.map(fn)))
    }
}

/**
 * Represents a promise for a result containing an array of values - values as opposed to objects
 */
export class ValueArrayResultPromise<E, T> extends ResultPromise<E, T[]> {
    public static build<E, T>(promise: ResultPromise<E, T[]>): ValueArrayResultPromise<E, T> {
        return extendedPromise(ValueArrayResultPromise, promise)
    }

    public count(): ResultPromise<E, number> {
        return this.map((values) => values.length)
    }

    public first(): ResultPromise<E, Maybe<T>> {
        return this.map((values) => Maybe.fromOptional(values[0]))
    }

    public filterOk(fn: (row: T) => boolean) {
        return this.map((values) => values.filter(fn))
    }

    public mapOk<K>(
        fn: (row: T) => K
    ): IfPlainObject<K, ObjectArrayResultPromise<E, K>, ValueArrayResultPromise<E, K>> {
        return ObjectArrayResultPromise.build(this.map((values) => values.map(fn)))
    }
}

/**
 * Represents a promise for maybe having an object
 */
export class MaybeObjectPromise<T extends {}> extends MaybePromise<T> {
    public static build<T extends {}>(promise: Promise<Maybe<T>>): MaybeObjectPromise<T> {
        return extendedPromise(MaybeObjectPromise, promise)
    }

    public field<K extends keyof T>(field: K): MaybePromise<T[K]> {
        return MaybePromise.from(this.then((maybeObj) => maybeObj.map((obj) => obj[field])))
    }

    public pick<K extends keyof T>(...fields: K[]) {
        return MaybePromise.from(this.then((maybeObj) => maybeObj.map((obj) => pick(obj, ...fields))))
    }

    public omit<K extends keyof T>(...fields: K[]) {
        return MaybePromise.from(this.then((maybeObj) => maybeObj.map((obj) => omit(obj, ...fields))))
    }
}

/**
 * Represents a promise for a result containing an array of values - values as opposed to objects
 */
export class MaybeObjectResultPromise<E, T extends {}> extends ResultPromise<E, Maybe<T>> {
    public static build<E, T extends {}>(promise: ResultPromise<E, Maybe<T>>): MaybeObjectResultPromise<E, T> {
        return extendedPromise(MaybeObjectResultPromise, promise)
    }

    public field<K extends keyof T>(field: K) {
        return this.map((maybeObj) => maybeObj.map((obj) => obj[field]))
    }

    public pick<K extends keyof T>(...fields: K[]) {
        return this.map((maybeObj) => maybeObj.map((obj) => pick(obj, ...fields)))
    }

    public omit<K extends keyof T>(...fields: K[]) {
        return this.map((maybeObj) => maybeObj.map((obj) => omit(obj, ...fields)))
    }
}

/**
 * Represents a promise for an array of objects
 */
export class ObjectArrayPromise<T extends {}> extends ValueArrayPromise<T> {
    public static build<T>(promise: Promise<T[]>): never
    public static build<T extends {}>(promise: Promise<T[]>): ObjectArrayPromise<T> {
        return extendedPromise(ObjectArrayPromise, promise)
    }

    public first(): MaybeObjectPromise<T> {
        return MaybeObjectPromise.build(this.then((rows) => Maybe.fromOptional(rows[0])))
    }

    public field<K extends keyof T>(field: K): ValueArrayPromise<T[K]> {
        return ValueArrayPromise.build<T[K]>(this.then((rows) => rows.map((item) => item[field])))
    }

    public pick<K extends keyof T>(...fields: K[]) {
        return this.map((row) => pick(row, ...fields))
    }

    public omit<K extends keyof T>(...fields: K[]) {
        return this.map((row) => omit(row, ...fields))
    }
}

/**
 * Represents a promise for a result containing an array of values - values as opposed to objects
 */
export class ObjectArrayResultPromise<E, T extends {}> extends ValueArrayResultPromise<E, T> {
    public static build<E, T>(promise: ResultPromise<E, T[]>): never
    public static build<E, T extends {}>(promise: ResultPromise<E, T[]>): ObjectArrayResultPromise<E, T> {
        return extendedPromise(ObjectArrayResultPromise, promise)
    }

    public first(): MaybeObjectResultPromise<E, T> {
        return MaybeObjectResultPromise.build(this.map((rows) => Maybe.fromOptional(rows[0])))
    }

    public field<K extends keyof T>(field: K): ValueArrayResultPromise<E, T[K]> {
        return ValueArrayResultPromise.build<E, T[K]>(this.mapOk((row) => row[field]))
    }

    public pick<K extends keyof T>(...fields: K[]) {
        return this.mapOk((row) => pick(row, ...fields))
    }

    public omit<K extends keyof T>(...fields: K[]) {
        return this.mapOk((row) => omit(row, ...fields))
    }
}
