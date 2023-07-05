import { NestFactory } from '@nestjs/core';
import { PokemonModule } from './pokemon.module';

async function bootstrap() {
  const app = await NestFactory.create(PokemonModule);
  await app.listen(3000);
}
bootstrap();
