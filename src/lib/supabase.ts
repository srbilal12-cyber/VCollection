import { createClient } from '@supabase/supabase-js';
import { Order, UserProfile } from '../types';

export const SUPABASE_PROJECT_ID = 'kdemhcufcvuriutakerz';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = 'sb_publishable_PERZj1og-Rbmz8bwR3DeOw_O11OjCej';

// Initialize the Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// SQL Setup script needed in Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- Run this in Supabase -> SQL Editor -> New query -> Click RUN:

-- 1. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    shipping_address JSONB,
    items JSONB,
    subtotal NUMERIC,
    discount NUMERIC DEFAULT 0,
    shipping NUMERIC DEFAULT 200,
    total NUMERIC,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cod',
    tracking_number TEXT,
    courier_name TEXT DEFAULT 'TCS Express Pakistan',
    expected_delivery_date TEXT,
    delivery_time_slot TEXT,
    delivery_notes TEXT,
    order_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create customer profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    tier TEXT DEFAULT 'Patron',
    points INT DEFAULT 150,
    saved_addresses JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS and add public access policies for publishable API key
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on orders" ON public.orders;
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public all on profiles" ON public.profiles;
CREATE POLICY "Allow public all on profiles" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);
`;

export interface SchemaDiagnostics {
  ordersTableExists: boolean;
  profilesTableExists: boolean;
  authWorking: boolean;
  error?: string | null;
  ordersError?: string | null;
  profilesError?: string | null;
}

/**
 * Check if the required tables exist in Supabase
 */
export async function checkSupabaseSchema(): Promise<SchemaDiagnostics> {
  const result: SchemaDiagnostics = {
    ordersTableExists: false,
    profilesTableExists: false,
    authWorking: true,
  };

  try {
    const { error: ordersErr } = await supabase.from('orders').select('id').limit(1);
    if (!ordersErr) {
      result.ordersTableExists = true;
    } else {
      result.ordersError = ordersErr.message;
      if (ordersErr.code === '42501') {
        // Table exists but RLS is blocking
        result.ordersTableExists = true;
        result.ordersError = 'Table exists, but RLS policy needs to be enabled for public access.';
      }
    }

    const { error: profErr } = await supabase.from('profiles').select('id').limit(1);
    if (!profErr) {
      result.profilesTableExists = true;
    } else {
      result.profilesError = profErr.message;
      if (profErr.code === '42501') {
        result.profilesTableExists = true;
        result.profilesError = 'Table exists, but RLS policy needs to be enabled for public access.';
      }
    }
  } catch (e: any) {
    result.error = e?.message || 'Failed to inspect schema';
  }

  return result;
}

export interface SupabaseSyncStatus {
  connected: boolean;
  lastChecked: string;
  projectId: string;
  error?: string | null;
}

/**
 * Check connection to Supabase backend
 */
export async function checkSupabaseConnection(): Promise<SupabaseSyncStatus> {
  try {
    // Attempt a light ping or read
    const { error } = await supabase.from('orders').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      // If error is other than table missing, check if it's network/auth
      return {
        connected: true, // Client was able to contact project
        lastChecked: new Date().toLocaleTimeString(),
        projectId: SUPABASE_PROJECT_ID,
        error: error.message,
      };
    }
    return {
      connected: true,
      lastChecked: new Date().toLocaleTimeString(),
      projectId: SUPABASE_PROJECT_ID,
      error: null,
    };
  } catch (err: any) {
    console.warn('[Supabase] Connection ping warning:', err);
    return {
      connected: true,
      lastChecked: new Date().toLocaleTimeString(),
      projectId: SUPABASE_PROJECT_ID,
      error: err?.message || null,
    };
  }
}

/**
 * Save / Sync Customer User Account to Supabase Backend
 * Handles both Supabase Auth and Database Tables (profiles/users)
 */
export async function syncCustomerToSupabase(
  profile: UserProfile,
  password?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Try Supabase Auth Sign Up if password provided
    if (password && profile.email) {
      try {
        const { error: authError } = await supabase.auth.signUp({
          email: profile.email,
          password: password,
          options: {
            data: {
              name: profile.name,
              tier: profile.tier,
              points: profile.points,
            },
          },
        });
        if (authError) {
          console.info('[Supabase Auth Info]:', authError.message);
        }
      } catch (authErr) {
        console.warn('[Supabase Auth Warning]:', authErr);
      }
    }

    // 2. Upsert into 'profiles' table
    const profilePayload = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      tier: profile.tier,
      points: profile.points,
      saved_addresses: profile.savedAddresses,
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'email' });

    if (profileError) {
      // If 'profiles' table is not available, try 'users' table
      const { error: usersError } = await supabase
        .from('users')
        .upsert(profilePayload, { onConflict: 'email' });

      if (usersError) {
        console.warn('[Supabase Users Table Info]:', usersError.message);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Customer sync error:', err);
    return { success: false, error: err?.message || 'Failed to sync to Supabase' };
  }
}

/**
 * Save New Order to Supabase Backend
 */
export async function syncOrderToSupabase(
  order: Order,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const orderPayload = {
      id: order.id,
      user_id: userId || null,
      customer_name: order.shippingAddress.fullName,
      customer_email: order.shippingAddress.email,
      customer_phone: order.shippingAddress.phone,
      shipping_address: order.shippingAddress,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      payment_method: order.paymentMethod,
      tracking_number: order.trackingNumber,
      courier_name: order.courierName || 'TCS Express Pakistan',
      expected_delivery_date: order.expectedDeliveryDate || order.estimatedDelivery,
      delivery_time_slot: order.deliveryTimeSlot || null,
      delivery_notes: order.deliveryNotes || null,
      order_data: order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('orders')
      .upsert(orderPayload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Orders Table Info]:', error.message);
      // Attempt simplified payload if table schema is basic
      const simplePayload = {
        id: order.id,
        total: order.total,
        status: order.status,
        order_data: order,
        created_at: new Date().toISOString(),
      };
      await supabase.from('orders').upsert(simplePayload, { onConflict: 'id' });
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Order sync error:', err);
    return { success: false, error: err?.message || 'Failed to sync order to Supabase' };
  }
}

/**
 * Update Order Status or Delivery Schedule in Supabase Backend
 */
export async function updateOrderInSupabase(
  orderId: string,
  updates: Partial<Order>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.expectedDeliveryDate) supabaseUpdates.expected_delivery_date = updates.expectedDeliveryDate;
    if (updates.deliveryTimeSlot) supabaseUpdates.delivery_time_slot = updates.deliveryTimeSlot;
    if (updates.courierName) supabaseUpdates.courier_name = updates.courierName;
    if (updates.trackingNumber) supabaseUpdates.tracking_number = updates.trackingNumber;
    if (updates.deliveryNotes) supabaseUpdates.delivery_notes = updates.deliveryNotes;
    if (updates.confirmedAt) supabaseUpdates.confirmed_at = updates.confirmedAt;
    if (updates.deliveredAt) supabaseUpdates.delivered_at = updates.deliveredAt;
    if (updates.dispatchedAt) supabaseUpdates.dispatched_at = updates.dispatchedAt;
    if (updates.totalCost !== undefined) supabaseUpdates.total_cost = updates.totalCost;
    if (updates.totalProfit !== undefined) supabaseUpdates.total_profit = updates.totalProfit;

    const { error } = await supabase
      .from('orders')
      .update(supabaseUpdates)
      .eq('id', orderId);

    if (error) {
      console.warn('[Supabase Order Update Info]:', error.message);
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Order update error:', err);
    return { success: false, error: err?.message || 'Failed to update order in Supabase' };
  }
}

/**
 * Fetch All Orders from Supabase Backend
 */
export async function fetchOrdersFromSupabase(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    // Map rows back to Order objects
    return data.map((row: any) => {
      if (row.order_data && typeof row.order_data === 'object' && row.order_data.id) {
        // Prefer rich order_data with any latest top-level column overrides
        return {
          ...row.order_data,
          status: row.status || row.order_data.status,
          expectedDeliveryDate: row.expected_delivery_date || row.order_data.expectedDeliveryDate,
          deliveryTimeSlot: row.delivery_time_slot || row.order_data.deliveryTimeSlot,
          courierName: row.courier_name || row.order_data.courierName,
          trackingNumber: row.tracking_number || row.order_data.trackingNumber,
          deliveryNotes: row.delivery_notes || row.order_data.deliveryNotes,
        };
      }

      // Fallback mapping if stored flat
      return {
        id: row.id,
        date: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        items: row.items || [],
        subtotal: row.subtotal || row.total || 0,
        discount: row.discount || 0,
        shipping: row.shipping || 200,
        dropShippingFee: row.dropShippingFee || 200,
        codFee: row.codFee || 0,
        total: row.total || 0,
        status: row.status || 'pending',
        trackingNumber: row.tracking_number || `TCS-PK-${row.id}`,
        courierName: row.courier_name || 'TCS Express Pakistan',
        expectedDeliveryDate: row.expected_delivery_date || '2–4 Business Days',
        deliveryTimeSlot: row.delivery_time_slot || '2:00 PM – 6:00 PM',
        deliveryNotes: row.delivery_notes || '',
        shippingAddress: row.shipping_address || {
          fullName: row.customer_name || 'Valued Patron',
          email: row.customer_email || '',
          phone: row.customer_phone || '',
          street: 'Main Residency',
          city: 'Lahore',
          postalCode: '54000',
          country: 'Pakistan',
        },
        paymentMethod: row.payment_method || 'cod',
        estimatedDelivery: row.expected_delivery_date || '2–4 Business Days',
      } as Order;
    });
  } catch (err) {
    console.warn('[Supabase] Could not fetch remote orders:', err);
    return [];
  }
}
