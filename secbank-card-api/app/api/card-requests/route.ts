import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  accountNumber: z.string().regex(/^\d{10}$/, "Account number must be 10 digits"),
  cardType: z.enum(["VERVE", "MASTERCARD", "VISA"]),
});

export async function POST(req: Request) {
  // 1. Read and validate the request body
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { accountNumber, cardType } = parsed.data;

  // 2. Validate the customer account exists and is active
  const account = await prisma.account.findUnique({ where: { accountNumber } });
  if (!account || !account.isActive) {
    return NextResponse.json({ error: "Account not found or inactive" }, { status: 404 });
  }

  // 3. Block duplicate pending requests
  const existing = await prisma.cardRequest.findFirst({
    where: { accountNumber, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A pending card request already exists", reference: existing.reference },
      { status: 409 }
    );
  }

  // 4. Create the request
  const created = await prisma.cardRequest.create({
    data: { reference: `CR-${Date.now()}`, accountNumber, cardType },
  });

  return NextResponse.json(
    { reference: created.reference, status: created.status, customerName: account.customerName },
    { status: 201 }
  );
}