import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const request = await prisma.cardRequest.findUnique({ where: { reference } });

  if (!request) {
    return NextResponse.json({ error: "Card request not found" }, { status: 404 });
  }

  return NextResponse.json({
    reference: request.reference,
    accountNumber: request.accountNumber,
    cardType: request.cardType,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  });
}