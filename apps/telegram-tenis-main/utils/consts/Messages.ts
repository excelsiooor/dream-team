import { Rating } from "../../entities/Rating";
import { keyboardHelp } from "../../keyboards/keyboard";

export const MESSAGES = {
  StartMessage: ( name: string | void ) => `З поверненням ${name  || 'no name'}, в телеграм бот для вдосконалення гри у насольний теніс та введення статистики.`,
  StartFerstMessage: ( name: string | void ) => `Мої привітання вас будо зарегистрировано як ${name  || 'no name'}, успіхів у майбутніх іграх.`,
  RatingMessage: ( value: Rating | undefined ) => {
    let result = 'Ваші показники:\n';
    if(value){
      result += `Всього ігор: ${value.totalMatches}\n`
      result += `Перемог: ${value.victory}\n`
      result += `Поразок: ${value.defeat}\n`
      result += `Рейтинг: ${value.score}\n`
      result += `Всього голів: ${value.totalGoals}\n`
      result += `Всього забитих голів: ${value.winGoals}\n`
      result += `Всього схибито голів: ${value.defeatGoals}\n`
    }
    return result;
  },
  Help:(commandList: string[]) => `${commandList.map(item => `${item} \n`)}`,
  KEYBOARD: {
    START : {
      reply_markup: keyboardHelp
    }
  }
}