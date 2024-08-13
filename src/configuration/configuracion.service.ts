import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConfiguracionService {

  private readonly logger = new Logger(ConfiguracionService.name);
  private config: Map<string, string> = new Map();

  constructor(
    @InjectRepository(Configuration)
    private configRepository: Repository<Configuration>,
  ) {
    this.logger.debug('ConfiguracionService initialized');
  }

  async loadConfig() {
    this.logger.debug('Loading configuration from database...');
    const configs = await this.configRepository.find();
    configs.forEach((config) => this.config.set(config.nom_key, config.nom_value));
    this.logger.debug('Configuration loaded.');
  }

  get(key: string): string {
    const value = this.config.get(key);
    if (!value) {
      this.logger.error(`Configuración key ${key} not found`);
      throw new Error(`Configuration key ${key} not found`);
    }
    return value;
  }

}
