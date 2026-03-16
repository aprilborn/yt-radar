import type { Channel } from "../db/types.js";

export function calculateNextCheck(
  ch: Channel,
  now: Date
): string | null {

  if (ch.pollType === "interval") {

    const ms = (ch.pollInterval ?? 0) * 60_000

    return new Date(now.getTime() + ms).toISOString()
  }

  if (ch.pollType === "time" && ch.pollTime) {

    const t = new Date(ch.pollTime)

    const year = now.getUTCFullYear()
    const month = now.getUTCMonth()
    const day = now.getUTCDate()

    let target = new Date(Date.UTC(
      year,
      month,
      day,
      t.getUTCHours(),
      t.getUTCMinutes(),
      0,
      0
    ))

    if (target <= now) {

      target = new Date(Date.UTC(
        year,
        month,
        day + 1,
        t.getUTCHours(),
        t.getUTCMinutes(),
        0,
        0
      ))

    }

    return target.toISOString()
  }

  return null
}

// export function calculateNextCheck(
//   ch: Channel,
//   now: Date
// ): string | null {

//   if (ch.pollType === "interval") {
//     const ms = (ch.pollInterval ?? 0) * 60_000;
//     return new Date(now.getTime() + ms).toISOString();
//   }

//   if (ch.pollType === "time" && ch.pollTime) {

//     const t = new Date(ch.pollTime);

//     const target = new Date(now);

//     target.setUTCHours(
//       t.getUTCHours(),
//       t.getUTCMinutes(),
//       0,
//       0
//     );

//     if (target <= now) {
//       target.setDate(target.getDate() + 1);
//     }

//     return target.toISOString();
//   }

//   return null;
// }