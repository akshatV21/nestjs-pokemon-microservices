import { Injectable } from '@nestjs/common';

@Injectable()
export class SpawnsService {
  getHello(): string {
    return 'Hello World!';
  }
}
