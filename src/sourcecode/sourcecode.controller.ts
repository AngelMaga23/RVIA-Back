import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SourcecodeService } from './sourcecode.service';
import { CreateSourcecodeDto } from './dto/create-sourcecode.dto';
import { UpdateSourcecodeDto } from './dto/update-sourcecode.dto';

@Controller('sourcecode')
export class SourcecodeController {
  constructor(private readonly sourcecodeService: SourcecodeService) {}

  @Post()
  create(@Body() createSourcecodeDto: CreateSourcecodeDto) {
    return this.sourcecodeService.create(createSourcecodeDto);
  }

  @Get()
  findAll() {
    return this.sourcecodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourcecodeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSourcecodeDto: UpdateSourcecodeDto) {
    return this.sourcecodeService.update(+id, updateSourcecodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourcecodeService.remove(+id);
  }
}
