import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationstatusService } from './applicationstatus.service';

describe('ApplicationstatusService', () => {
  let service: ApplicationstatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationstatusService],
    }).compile();

    service = module.get<ApplicationstatusService>(ApplicationstatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
