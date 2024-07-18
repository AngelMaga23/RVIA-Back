import { Module } from '@nestjs/common';
import { SourcecodeService } from './sourcecode.service';
import { SourcecodeController } from './sourcecode.controller';

@Module({
  controllers: [SourcecodeController],
  providers: [SourcecodeService],
})
export class SourcecodeModule {}
