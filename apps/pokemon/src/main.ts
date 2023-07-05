import { NestFactory } from '@nestjs/core';
import { PokemonModule } from './pokemon.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(PokemonModule);
  const configService = app.get<ConfigService>(ConfigService);

  const PORT = configService.get('PORT');

  await app.listen(PORT, () =>
    console.log(`Pokemon service is listening to requests on port: ${PORT}`),
  );
}
bootstrap();
