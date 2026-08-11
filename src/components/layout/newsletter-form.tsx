import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Replace with the real Mailchimp list action URL when available
// (see /integritetspolicy — nyhetsbrev hanteras via Mailchimp, eepurl.com).
const MAILCHIMP_ACTION_URL = 'https://armeringsmaskiner.us1.list-manage.com/subscribe/post';

export function NewsletterForm() {
  return (
    <form
      action={MAILCHIMP_ACTION_URL}
      method="post"
      target="_blank"
      className="flex flex-col gap-2 sm:flex-row"
    >
      <div className="flex-1">
        <Label htmlFor="newsletter-email" className="sr-only">
          E-postadress
        </Label>
        <Input
          id="newsletter-email"
          type="email"
          name="EMAIL"
          placeholder="din@epost.se"
          required
        />
      </div>
      <Button type="submit">Prenumerera</Button>
    </form>
  );
}
