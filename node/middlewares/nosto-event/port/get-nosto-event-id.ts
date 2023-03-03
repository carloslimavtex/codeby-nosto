export default function getNostoEventId(body: unknown) {
  const id = (body as Record<string, string> | undefined)?.documentId;

  if (!id) {
    return null;
  }

  return id;
}
