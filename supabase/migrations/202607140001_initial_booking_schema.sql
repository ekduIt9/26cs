create extension if not exists btree_gist;

create type public.app_role as enum ('CUSTOMER', 'OWNER', 'DRIVER');
create type public.booking_status as enum (
  'REQUESTED', 'QUOTED', 'CUSTOMER_ACCEPTED', 'CONFIRMED',
  'DRIVER_EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED',
  'REJECTED', 'CANCELLED'
);
create type public.payment_status as enum ('UNPAID', 'DEPOSITED', 'PAID', 'REFUNDED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'CUSTOMER',
  full_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plate_number text not null unique,
  capacity smallint not null check (capacity between 1 and 16),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  customer_id uuid not null references public.profiles(id),
  driver_id uuid references public.profiles(id),
  vehicle_id uuid references public.vehicles(id),
  status public.booking_status not null default 'REQUESTED',
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  destination_address text not null,
  destination_lat double precision,
  destination_lng double precision,
  pickup_at timestamptz not null,
  service_start_at timestamptz not null,
  service_end_at timestamptz not null,
  passenger_count smallint not null check (passenger_count between 1 and 16),
  trip_type text not null default 'ONE_WAY' check (trip_type in ('ONE_WAY', 'ROUND_TRIP', 'MULTI_DAY')),
  notes text,
  quoted_amount numeric(12, 0) check (quoted_amount is null or quoted_amount >= 0),
  quote_expires_at timestamptz,
  payment_status public.payment_status not null default 'UNPAID',
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_service_window check (service_end_at > service_start_at)
);

alter table public.bookings add constraint no_overlapping_active_bookings
  exclude using gist (
    vehicle_id with =,
    tstzrange(service_start_at, service_end_at, '[)') with &&
  ) where (status in ('CONFIRMED', 'DRIVER_EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'));

create table public.booking_events (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  actor_id uuid not null references public.profiles(id),
  from_status public.booking_status,
  to_status public.booking_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.vehicle_locations (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  driver_id uuid not null references public.profiles(id),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_meters double precision check (accuracy_meters is null or accuracy_meters >= 0),
  speed_mps double precision check (speed_mps is null or speed_mps >= 0),
  device_recorded_at timestamptz not null,
  received_at timestamptz not null default now()
);

create index bookings_customer_id_idx on public.bookings(customer_id, pickup_at desc);
create index bookings_driver_id_idx on public.bookings(driver_id, pickup_at desc);
create index vehicle_locations_booking_latest_idx on public.vehicle_locations(booking_id, device_recorded_at desc);

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'OWNER');
$$;

create or replace function public.is_driver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'DRIVER');
$$;

create or replace function public.driver_transition_booking(
  p_booking_id uuid,
  p_to_status public.booking_status
)
returns public.booking_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from_status public.booking_status;
begin
  select status
    into v_from_status
    from public.bookings
   where id = p_booking_id
     and driver_id = auth.uid()
   for update;

  if v_from_status is null then
    raise exception 'Booking is not assigned to the current driver';
  end if;

  if not (
    (v_from_status = 'CONFIRMED' and p_to_status = 'DRIVER_EN_ROUTE') or
    (v_from_status = 'DRIVER_EN_ROUTE' and p_to_status = 'ARRIVED') or
    (v_from_status = 'ARRIVED' and p_to_status = 'IN_PROGRESS') or
    (v_from_status = 'IN_PROGRESS' and p_to_status = 'COMPLETED')
  ) then
    raise exception 'Invalid driver transition from % to %', v_from_status, p_to_status;
  end if;

  update public.bookings
     set status = p_to_status,
         updated_at = now()
   where id = p_booking_id;

  insert into public.booking_events(booking_id, actor_id, from_status, to_status)
  values (p_booking_id, auth.uid(), v_from_status, p_to_status);

  return p_to_status;
end;
$$;

revoke all on function public.driver_transition_booking(uuid, public.booking_status) from public;
grant execute on function public.driver_transition_booking(uuid, public.booking_status) to authenticated;

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;
alter table public.vehicle_locations enable row level security;

create policy "profiles read self or owner" on public.profiles for select
  using (id = auth.uid() or public.is_owner());
create policy "profiles update self or owner" on public.profiles for update
  using (id = auth.uid() or public.is_owner()) with check (id = auth.uid() or public.is_owner());

create policy "authenticated read vehicles" on public.vehicles for select to authenticated using (true);
create policy "owners manage vehicles" on public.vehicles for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

create policy "customers create bookings" on public.bookings for insert to authenticated
  with check (customer_id = auth.uid() and status = 'REQUESTED');
create policy "booking participants read" on public.bookings for select to authenticated
  using (customer_id = auth.uid() or driver_id = auth.uid() or public.is_owner());
create policy "owners manage bookings" on public.bookings for all to authenticated
  using (public.is_owner()) with check (public.is_owner());
create policy "booking participants read events" on public.booking_events for select to authenticated
  using (exists(select 1 from public.bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.driver_id = auth.uid() or public.is_owner())));
create policy "owner or assigned driver add events" on public.booking_events for insert to authenticated
  with check (actor_id = auth.uid() and (public.is_owner() or exists(select 1 from public.bookings b where b.id = booking_id and b.driver_id = auth.uid())));

create policy "participants read active locations" on public.vehicle_locations for select to authenticated
  using (exists(select 1 from public.bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.driver_id = auth.uid() or public.is_owner()) and b.status in ('CONFIRMED', 'DRIVER_EN_ROUTE', 'ARRIVED', 'IN_PROGRESS')));
create policy "assigned driver inserts locations" on public.vehicle_locations for insert to authenticated
  with check (driver_id = auth.uid() and exists(select 1 from public.bookings b where b.id = booking_id and b.driver_id = auth.uid() and b.status in ('DRIVER_EN_ROUTE', 'ARRIVED', 'IN_PROGRESS')));
