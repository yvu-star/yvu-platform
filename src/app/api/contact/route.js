import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return Response.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Name is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return Response.json(
        { success: false, error: 'A valid email is required.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Message is required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from('messages').insert([
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || null,
        message: message.trim(),
        is_read: false,
      },
    ]);

    if (error) {
      console.error('[contact] Supabase insert error:', error.message);
      return Response.json(
        { success: false, error: 'Could not save your message. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: 'Your message has been received. Thank you!' },
      { status: 201 }
    );

  } catch (err) {
    console.error('[contact] Unexpected error:', err.message);
    return Response.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}