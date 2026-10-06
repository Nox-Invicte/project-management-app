export default function PagePlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="scaffold-page">
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <span>{description}</span>
      <small>Page scaffolded for the web client. Connect this screen to the shared API as the feature is implemented.</small>
    </main>
  );
}
