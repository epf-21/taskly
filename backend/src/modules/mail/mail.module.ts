import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailListener } from './mail.listener';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule],
  providers: [MailService, MailListener],
  exports: [MailService],
})
export class MailModule {}
