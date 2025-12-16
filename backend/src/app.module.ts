import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    // ConfigModule: carrega as variáveis do arquivo .env
    ConfigModule.forRoot({
      isGlobal: true, // Disponível em todos os módulos
    }),

    // TypeOrmModule: configura a conexão com o banco PostGIS
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres", // Tipo do banco
        host: configService.get("DB_HOST", "localhost"),
        port: parseInt(configService.get("DB_PORT", "5432")),
        username: configService.get("DB_USER", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_NAME", "nestjs_db"),

        // Busca todas as entities automaticamente
        entities: [__dirname + "/**/*.entity{.ts,.js}"],

        // CUIDADO: synchronize cria/atualiza tabelas automaticamente
        // Em produção, use migrations!
        synchronize: configService.get("NODE_ENV") !== "production",

        // Mostra queries SQL no console (útil para debug)
        logging: configService.get("NODE_ENV") === "development",
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
