import "server-only";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { list, put } from "@vercel/blob";

/** Armazenamento simples de objetos por caminho; nunca sobrescreve um caminho existente. */
export interface ObjectStorage {
  exists(path: string): Promise<boolean>;
  put(path: string, bytes: Uint8Array, contentType: string): Promise<void>;
  /** Retorna o conteúdo dos objetos cujo caminho começa com o prefixo. */
  readAll(prefix: string): Promise<Uint8Array[]>;
}

/** Produção (Vercel): usa Vercel Blob com o token BLOB_READ_WRITE_TOKEN. */
export class VercelBlobObjectStorage implements ObjectStorage {
  private async listBlobs(prefix: string) {
    const blobs: { pathname: string; url: string }[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return blobs;
  }

  async exists(path: string) {
    return (await this.listBlobs(path)).some((blob) => blob.pathname === path);
  }

  async put(path: string, bytes: Uint8Array, contentType: string) {
    await put(path, Buffer.from(bytes), { access: "public", addRandomSuffix: false, allowOverwrite: false, contentType });
  }

  async readAll(prefix: string) {
    const blobs = await this.listBlobs(prefix);
    return Promise.all(blobs.map(async (blob) => {
      const response = await fetch(blob.url, { cache: "no-store" });
      if (!response.ok) throw new Error(`Falha ao ler objeto armazenado (${response.status}).`);
      return new Uint8Array(await response.arrayBuffer());
    }));
  }
}

/** Desenvolvimento local: grava em .data/ na raiz do projeto. */
export class LocalFileObjectStorage implements ObjectStorage {
  constructor(private readonly root: string = join(process.cwd(), ".data")) {}

  async exists(path: string) {
    try { await access(join(this.root, path)); return true; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
  }

  async put(path: string, bytes: Uint8Array) {
    const target = join(this.root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes, { flag: "wx" });
  }

  /** O prefixo deve ser uma pasta terminada em "/" (ex.: "results/"). */
  async readAll(prefix: string) {
    const directory = join(this.root, prefix);
    let names: string[];
    try { names = await readdir(directory); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
    return Promise.all(names.map(async (name) => new Uint8Array(await readFile(join(directory, name)))));
  }
}

/** Usa o Blob quando o token existe; sem ele, só permite o fallback local fora de produção. */
export function createObjectStorage(): ObjectStorage {
  if (process.env.BLOB_READ_WRITE_TOKEN) return new VercelBlobObjectStorage();
  if (process.env.NODE_ENV === "production") throw new Error("BLOB_READ_WRITE_TOKEN não configurado.");
  return new LocalFileObjectStorage();
}
