# Stripe webhooks (My Spools Cloud)

Endpoint: `POST /api/v1/billing/webhooks/stripe`

## Security

- Raw body + `Stripe-Signature` verification (`STRIPE_WEBHOOK_SECRET`)
- Event IDs stored in `processed_webhook_events` (unique per provider+event)
- Fail closed on signature / amount / currency / account metadata mismatch

## Event mapping

| Stripe event | Effect |
|--------------|--------|
| `checkout.session.completed` (payment_status=paid, PI succeeded) | Apply grant once |
| `checkout.session.async_payment_succeeded` | Same as paid |
| `checkout.session.completed` (unpaid) | Pending — no grant |
| `checkout.session.async_payment_failed` | Mark payment failed |
| `checkout.session.expired` | Mark payment expired |
| `charge.refunded` | Full: revoke grant; partial: admin review flag |
| `charge.dispute.created` | Mark disputed; keep data; admin review |

Success URL redirects **never** activate entitlements.
