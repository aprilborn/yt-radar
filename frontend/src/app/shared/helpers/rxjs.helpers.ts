import {
  defaultIfEmpty,
  filter,
  finalize,
  Observable,
  OperatorFunction,
  pipe,
  throwIfEmpty,
  UnaryFunction,
} from 'rxjs';

export interface Next<T> {
  complete?: () => void;
  error?: () => Error;
  defaultValue?: T;
}

export const filterDefined: <T>() => OperatorFunction<T, T> = () => filter(Boolean);

export const filterDefinedList: <T>() => OperatorFunction<T, T> = <T>() =>
  filter((array: T & { length?: number }) => !!array?.length);

export const withDefaultList: <T>(next?: Partial<Next<T>>) => UnaryFunction<Observable<T>, Observable<T>> = <T>(
  next: Partial<Next<T>>,
) => pipe(filterDefinedList<T>(), defaultIfEmpty(next?.defaultValue), finalize(next?.complete));

export const withError: <T>(next?: Partial<Next<T>>) => UnaryFunction<Observable<T>, Observable<T>> = <T>(
  next: Partial<Next<T>>,
) => pipe(filterDefined<T>(), throwIfEmpty(next?.error), finalize(next?.complete));

export const withErrorList: <T>(next?: Partial<Next<T>>) => UnaryFunction<Observable<T>, Observable<T>> = <T>(
  next: Partial<Next<T>>,
) => pipe(filterDefinedList<T>(), throwIfEmpty(next?.error), finalize(next?.complete));
