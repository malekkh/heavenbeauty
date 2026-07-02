-- Heaven Beauty — per-country delivery rate.
-- A flat delivery charge per country, added to the order total at checkout.

-- ----------------------------------------------------------------------------
-- countries.delivery_rate — flat delivery charge in the country's currency
-- ----------------------------------------------------------------------------
alter table countries
  add column if not exists delivery_rate numeric(10,2) not null default 0;

-- ----------------------------------------------------------------------------
-- orders.delivery — the delivery charged on this order (snapshot at purchase).
-- Final total = subtotal + delivery.
-- ----------------------------------------------------------------------------
alter table orders
  add column if not exists delivery numeric(10,2) not null default 0;
