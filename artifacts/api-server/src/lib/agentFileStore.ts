import { ObjectStorageService, objectStorageClient } from "./objectStorage";

const storage = new ObjectStorageService();
const MAX_FILE_BYTES = 512 * 1024;

export function normalizeAgentPath(input: string): string {
  if (
    input.length === 0 ||
    input.length > 240 ||
    input.startsWith("/") ||
    input.includes("\\") ||
    input.includes("\0")
  ) {
    throw new Error("File paths must be relative and no longer than 240 characters.");
  }

  const segments = input.split("/");
  if (
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        !/^[A-Za-z0-9._ -]+$/.test(segment),
    )
  ) {
    throw new Error("File path contains an unsupported or unsafe segment.");
  }

  return segments.join("/");
}

export function buildAgentObjectPath(
  ownerId: string,
  projectId: string,
  relativePath: string,
): string {
  if (!/^[A-Za-z0-9_-]+$/.test(ownerId) || !/^[A-Za-z0-9_-]+$/.test(projectId)) {
    throw new Error("Invalid project owner or identifier.");
  }
  return `/objects/nabeen/${ownerId}/${projectId}/${normalizeAgentPath(relativePath)}`;
}

function getAgentObjectFile(objectPath: string) {
  if (!objectPath.startsWith("/objects/nabeen/")) {
    throw new Error("Invalid private project file path.");
  }

  const privateDir = storage.getPrivateObjectDir().replace(/^\/+/, "");
  const [bucketName, ...privatePrefix] = privateDir.split("/");
  const entityName = objectPath.slice("/objects/".length);
  if (!bucketName || !privatePrefix.length || !entityName) {
    throw new Error("Private project storage is not configured.");
  }

  return objectStorageClient
    .bucket(bucketName)
    .file([...privatePrefix, entityName].join("/"));
}

export async function writeAgentFileObject(
  objectPath: string,
  content: string,
): Promise<void> {
  if (Buffer.byteLength(content, "utf8") > MAX_FILE_BYTES) {
    throw new Error("Project files cannot exceed 512 KB.");
  }

  await getAgentObjectFile(objectPath).save(content, {
    resumable: false,
    metadata: {
      contentType: "text/plain; charset=utf-8",
      cacheControl: "private, no-store",
    },
  });
}

export async function readAgentFileObject(objectPath: string): Promise<string> {
  const file = getAgentObjectFile(objectPath);
  const [exists] = await file.exists();
  if (!exists) throw new Error("Project file content is missing from private storage.");
  const [buffer] = await file.download();
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new Error("Stored project file exceeds the configured size limit.");
  }
  return buffer.toString("utf8");
}