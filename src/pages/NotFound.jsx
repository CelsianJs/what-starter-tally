import { Link, route } from 'what-framework/router';

export default function NotFound() {
  return (
    <section class="empty-state page-enter">
      <p class="eyebrow">404</p>
      <h1>This invoice path is not filed.</h1>
      <p>No Tally page exists for <code>{route.path}</code>.</p>
      <Link class="button primary" href="/drafts">Return to drafts</Link>
    </section>
  );
}
