-- Enum extensions must be committed before being referenced by DDL/DML.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';

ALTER TYPE public.ticket_status ADD VALUE IF NOT EXISTS 'assigned';
ALTER TYPE public.ticket_status ADD VALUE IF NOT EXISTS 'waiting_customer';

ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'viewed';
ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'cancelled';

ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'issued';
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'cancelled';

ALTER TYPE public.quote_request_status ADD VALUE IF NOT EXISTS 'qualified';
ALTER TYPE public.quote_request_status ADD VALUE IF NOT EXISTS 'quote_created';

ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'task';
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'follow_up';

DO $$ BEGIN
  CREATE TYPE public.user_account_status AS ENUM ('invited','active','suspended','deactivated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_channel AS ENUM ('dashboard','email','sms','whatsapp','webhook');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_event AS ENUM (
    'lead_created','quote_request_created','ticket_created','ticket_replied',
    'ticket_assigned','quote_sent','quote_accepted','invoice_sent',
    'payment_recorded','task_assigned'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;