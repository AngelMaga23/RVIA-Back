import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationstatusController } from './applicationstatus.controller';
import { ApplicationstatusService } from './applicationstatus.service';

describe('ApplicationstatusController', () => {
  let controller: ApplicationstatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationstatusController],
      providers: [ApplicationstatusService],
    }).compile();

    controller = module.get<ApplicationstatusController>(ApplicationstatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
