import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { channel, settings } from "./schema.js";

export type Channel = InferSelectModel<typeof channel>;
export type NewChannel = InferInsertModel<typeof channel>;

export type Settings = InferSelectModel<typeof settings>;