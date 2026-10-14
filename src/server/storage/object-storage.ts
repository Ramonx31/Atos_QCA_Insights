import "server-only";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/** Armazenamento simples de objetos por caminho; nunca sobrescreve um caminho existente. */
export interface ObjectStorage {
  exists(path: string): Promise<boolean>;
  put(path: string, bytes: Uint8Array, contentType: string): Promise<void>;
  /** Retorna o conteúdo dos objetos cujo caminho começa com o prefixo. */
  readAll(prefix: string): Promise<Uint8Array[]>;
}

/** Armazenamento local: grava em .data/ na raiz do projeto. */
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

/** A plataforma é executada localmente e persiste somente em disco. */
export function createObjectStorage(): ObjectStorage {
  return new LocalFileObjectStorage();
}
