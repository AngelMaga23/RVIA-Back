import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cluster from 'cluster';
import * as os from 'os';

const numCPUs = process.env.WORKERS_COUNT ? parseInt(process.env.WORKERS_COUNT, 10) : os.cpus().length;

// Numero de núcleos a utilizar (en este caso, 1 por cada núcleo disponible)
const workersPerCore = 1; // Puedes cambiar esto según las necesidades
const totalWorkers = workersPerCore * numCPUs;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  app.useGlobalPipes( 
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }) 
  );

  const config = new DocumentBuilder()
  .setTitle('RVIA Api ')
  .setDescription('Descripción RVIA api')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);  

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

if (cluster.isPrimary) {
  console.log(`Primary/Master ${process.pid} is running`);

  // Crear trabajadores (workers)
  for (let i = 0; i < totalWorkers; i++) {
    console.log(`Cantidad de Worker utilizados:   ${i}`);
    cluster.fork();
  } 

  // Monitorear si un trabajador muere y reiniciar uno nuevo
  cluster.on('exit', (worker, code, signal) => {
    console.error(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    const delay = Math.random() * 1000 + 500;  // Espera entre 500 ms y 1500 ms

    setTimeout(() => {
      console.log('Starting a new worker...');
      cluster.fork();
    }, delay);
  });

  // Manejar el evento de inicio de un trabajador
  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

} else {
  // Ejecutar el bootstrap en los trabajadores
  bootstrap();

  // Manejar el cierre del proceso de manera ordenada
  process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid} received SIGTERM. Exiting...`);
    process.exit(0);
  });
}
