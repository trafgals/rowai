import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { data } = await req.json();
  const email = data.email_addresses?.[0]?.email_address;
  const firstName = data.first_name;
  const lastName = data.last_name;
  
  console.log('Clerk webhook received:', { email, firstName, lastName });
  
  return new NextResponse('OK', { status: 200 });
}
