import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';

interface iSignupParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async signup({ email, password, name, phone }: iSignupParams) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone,
        user_type: UserType.BUYER,
      },
    });

    const token = await jwt.sign(
      {
        name,
        is: user.id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: 3600000,
      },
    );

    return token;
  }
}
