import { Module } from '@nestjs/common';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [ApplicationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
