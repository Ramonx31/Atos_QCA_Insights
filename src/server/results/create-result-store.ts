import "server-only";
import { ResultStore } from "@/server/results/result-store";
import { createObjectStorage } from "@/server/storage/object-storage";

export function createResultStore(): ResultStore {
  return new ResultStore(createObjectStorage());
}
