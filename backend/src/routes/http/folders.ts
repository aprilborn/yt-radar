import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import fsp from "node:fs/promises";
import path from "node:path";

import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import type { Settings } from "../../db/types.js";
import * as ytdlp from "../../services/ytdlp.js";

/**
 * How deep the walk goes. A destination folder is a shelf, not an archive
 * tree: "podcasts/history" is a realistic value someone types, three levels
 * of nesting below that is not — and every extra level multiplies the number
 * of directories a spinning disk has to stat before the form can suggest
 * anything.
 */
const MAX_DEPTH = 3;

/**
 * A hard cap on the answer. Someone whose downloads root is one folder per
 * channel can reach hundreds; past this the list has stopped being an
 * autocomplete and the truncation is invisible in practice.
 */
const MAX_FOLDERS = 500;

/**
 * Directories nobody is choosing as a destination: dotfiles, the recycle bins
 * NAS shares leave behind, and macOS/Windows metadata.
 */
function isHidden(name: string): boolean {
  return name.startsWith(".") || name === "@eaDir" || name === "$RECYCLE.BIN";
}

/**
 * Every directory under `root`, as slash-joined paths relative to it — the
 * exact shape a `tag` / `destinationFolder` value takes, so a suggestion can
 * be submitted back verbatim.
 *
 * Symlinks are not followed (`withFileTypes` reports the link itself, and
 * `isDirectory()` is false for it): a link pointing back up the tree would
 * otherwise walk forever, and one pointing outside the root would offer a
 * destination that `buildHomeDir` refuses to write to anyway.
 */
async function listFolders(
  root: string,
  prefix = "",
  depth = 0,
  found: string[] = []
): Promise<string[]> {
  if (depth >= MAX_DEPTH || found.length >= MAX_FOLDERS) return found;

  let entries;

  try {
    entries = await fsp.readdir(path.join(root, prefix), { withFileTypes: true });
  } catch {
    // A directory that vanished mid-walk, or one the process cannot read.
    // The rest of the tree is still a useful answer.
    return found;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || isHidden(entry.name)) continue;
    if (found.length >= MAX_FOLDERS) break;

    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

    found.push(relative);

    await listFolders(root, relative, depth + 1, found);
  }

  return found;
}

export async function foldersRoutes(app: FastifyInstance) {
  /**
   * The folders that already exist inside the downloads root, for the folder
   * autocomplete on both forms. Read from disk rather than from the saved
   * subscriptions, so a folder created by hand — or by a manual download that
   * no subscription knows about — is offered too.
   */
  app.get("/api/folders", async () => {
    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.id, 1));

    // Only the downloads directory matters here, and it is absent until
    // someone saves settings — the resolver falls back to the default root.
    const root = ytdlp.downloadsRoot({
      downloadsDir: row?.downloadsDir ?? null
    } as Settings);
    const folders = await listFolders(root);

    return { root, folders: folders.sort((a, b) => a.localeCompare(b)) };
  });
}
