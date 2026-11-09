import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesModule } from './modules/templates/templates.module';
import { DocumentsModule } from './modules/documents/documents.module';
export const { ObserveModule, ObserveInstrument } = createObserveModule();
import dns from "node:dns/promises";
import { APP_INTERCEPTOR } from '@nestjs/core/constants.js';
import { TransformInterceptor } from './core/transform.interceptor';
dns.setServers(["1.1.1.1"]);
@Module({
  imports: [
   ConfigModule.forRoot({ isGlobal: true}),
   MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
   TemplatesModule,
   DocumentsModule
  
    
    
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor}
  ],
})
export class AppModule {}
