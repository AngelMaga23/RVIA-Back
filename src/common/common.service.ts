import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository,EntityMetadata, DataSource  } from 'typeorm';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

@Injectable()
export class CommonService {

  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  private readonly oldKey?: Buffer;
  private readonly newKey?: Buffer;

  constructor(private configService: ConfigService, private dataSource: DataSource) {
    const secretKey = this.configService.get<string>('SECRET_KEY');

    const oldSecretKey = this.configService.get<string>('OLD_SECRET_KEY');
    const newSecretKey = this.configService.get<string>('NEW_SECRET_KEY');

    this.key = createHash('sha256').update(secretKey).digest().slice(0, 32);

    this.oldKey = oldSecretKey ? createHash('sha256').update(oldSecretKey).digest().slice(0, 32) : undefined;
    this.newKey = newSecretKey ? createHash('sha256').update(newSecretKey).digest().slice(0, 32) : undefined;
  }

  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  encryptNewKey(text: string, key: Buffer): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  

  async reEncryptAllEntities(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    console.log(this.oldKey)
    console.log(this.newKey)
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      const records = await repository.find();

      for (const record of records) {
        console.log(record)
        let updated = false;

        for (const column of entity.columns) {
          const columnName = column.propertyName;
          const columnValue = record[columnName];

          if (typeof columnValue === 'string' && columnValue.includes(':')) {
            const decryptedData = this.decrypt(columnValue);
            if (decryptedData !== columnValue) { // Si la desencriptación tuvo éxito
              const reEncryptedData = this.encryptNewKey(decryptedData, this.newKey);
              record[columnName] = reEncryptedData;
              updated = true;
            }
          }
        }

        if (updated) {
          await repository.save(record);
        }
      }
    }

    console.log('Re-encryption process completed for all detected encrypted fields.');
  }
  
}
