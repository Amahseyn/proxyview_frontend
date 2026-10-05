type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

function serializeJsonLd(data: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];
  const serialized = serializeJsonLd(payload.length === 1 ? payload[0] : payload);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
