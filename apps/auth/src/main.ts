import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get<ConfigService>(ConfigService);

  const PORT = configService.get('PORT');

  await app.listen(PORT, () =>
    console.log(`Auth service is listening to requests on port: ${PORT}`),
  );
}
bootstrap();
