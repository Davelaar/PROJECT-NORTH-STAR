# Cloud refund and dispute policy

## Full refund

- Payment → `refunded`
- Revoke only the grant linked to that payment
- Recompute `paid_until` from remaining active grants
- Export remains available during retention rules

## Partial refund

- Payment → `partially_refunded`
- Entitlement duration unchanged
- `admin_review_required=true`

## Dispute

- Payment → `disputed`
- Do not immediately delete inventory
- Admin notified via review flag
- Resolve after Stripe dispute outcome (manual admin actions)

OpenFilament does not store card data and never charges off-session.
