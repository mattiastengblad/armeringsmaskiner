import type { InquiryFormValues } from '@/lib/validation/inquiry';

interface InquiryEmailContext {
  values: InquiryFormValues;
  productName: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildStaffNotificationEmail({ values, productName }: InquiryEmailContext) {
  const subject = productName
    ? `Ny förfrågan om ${productName} från ${values.name}`
    : `Ny kontaktförfrågan från ${values.name}`;

  const rows: [string, string][] = [
    ['Namn', values.name],
    ['E-post', values.email],
    ...(values.phone ? ([['Telefon', values.phone]] as [string, string][]) : []),
    ...(values.company ? ([['Företag', values.company]] as [string, string][]) : []),
    ...(productName ? ([['Produkt', productName]] as [string, string][]) : []),
  ];

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #111;">
      <h2>${productName ? 'Ny förfrågan om ' + escapeHtml(productName) : 'Ny kontaktförfrågan'}</h2>
      <table cellpadding="4">
        ${rows.map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join('')}
      </table>
      <p><strong>Meddelande:</strong></p>
      <p>${escapeHtml(values.message).replace(/\n/g, '<br>')}</p>
    </div>
  `;

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Meddelande:',
    values.message,
  ].join('\n');

  return { subject, html, text };
}

export function buildCustomerConfirmationEmail({ values, productName }: InquiryEmailContext) {
  const subject = 'Tack för din förfrågan – Armeringsmaskiner.se';

  const intro = productName
    ? `Tack för din förfrågan om ${productName}. Vi hör av oss inom kort.`
    : 'Tack för ditt meddelande. Vi hör av oss inom kort.';

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #111;">
      <p>Hej ${escapeHtml(values.name)},</p>
      <p>${escapeHtml(intro)}</p>
      <p>Med vänliga hälsningar,<br>Per Lindgren<br>Armeringsmaskiner.se</p>
    </div>
  `;

  const text = `Hej ${values.name},\n\n${intro}\n\nMed vänliga hälsningar,\nPer Lindgren\nArmeringsmaskiner.se`;

  return { subject, html, text };
}
