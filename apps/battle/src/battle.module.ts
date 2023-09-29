import { Module } from '@nestjs/common';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';

@Module({
  imports: [],
  controllers: [BattleController],
  providers: [BattleService],
})
export class BattleModule {}
