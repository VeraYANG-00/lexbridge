export default function PageStub({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">{description}</p>
    </section>
  );
}