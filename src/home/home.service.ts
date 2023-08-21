import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';
import { PropertyType } from '@prisma/client';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  property_type?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}
  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    console.log(filter);
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filter,
    });

    if (!homes.length) {
      throw new NotFoundException();
    }

    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }

  async getHomeById(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: { id },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return new HomeResponseDto(home);
  }
}
