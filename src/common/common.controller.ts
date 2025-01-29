import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { CommonService } from './common.service';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}
  @Get()
  async reEncryptDatabase() {
    await this.commonService.reEncryptAllEntities();
    return 'Re-encryption process completed!';
  }
}
