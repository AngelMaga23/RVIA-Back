import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  app.useGlobalPipes( 
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }) 
  );

  // Habilita CORS
  app.enableCors({
    origin: '*', // Permite todas las URLs de origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // await app.listen(3000);
  await app.listen(process.env.PORT);
  logger.log(`App running on port ${ process.env.PORT }`);
}
bootstrap();
