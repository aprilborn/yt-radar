import { Observable } from 'rxjs';

export function equal<T, R>(source: T, target: R): boolean {
  return Object.keys(source).every((key) =>
    target?.hasOwnProperty(key)
      ? source[key] && typeof source[key] === 'object'
        ? equal(source[key], target[key])
        : source[key] === target[key]
      : false,
  );
}

export function equalJson<T, R>(source: T, target: R): boolean {
  return JSON.stringify(source) === JSON.stringify(target);
  // return source.split(':').map(Number).reduce((acc, curr) => acc * 60 + curr, 0) === target.split(':').map(Number).reduce((acc, curr) => acc * 60 + curr, 0);
}

export const textWriterEffect = (text: string): Observable<string> => {
  return new Observable<string>((subscriber) => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      subscriber.next(text.slice(0, currentIndex));
      currentIndex++;
      if (currentIndex > text.length) {
        clearInterval(interval);
        subscriber.complete();
      }
    }, 100);
  });
};

export const clearTextEffect = (text: string): Observable<string> => {
  return new Observable<string>((subscriber) => {
    let currentIndex = text.length;
    const interval = setInterval(() => {
      subscriber.next(text.slice(0, currentIndex));
      currentIndex--;
      if (currentIndex < 0) {
        clearInterval(interval);
        subscriber.complete();
      }
    }, 100);
  });
};
