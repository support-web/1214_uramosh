import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'パスワードは英字と数字を含めてください'),
  role: z.enum(['CLIENT', 'DIVINER']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        role: validatedData.role,
      },
    });

    // 役割に応じてクライアントまたは占い師のプロフィールを作成
    if (validatedData.role === 'CLIENT') {
      await prisma.client.create({
        data: {
          userId: user.id,
          nickname: validatedData.name,
        },
      });
    } else if (validatedData.role === 'DIVINER') {
      await prisma.diviner.create({
        data: {
          userId: user.id,
          displayName: validatedData.name,
          status: 'PENDING',
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'ユーザー登録が完了しました',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
