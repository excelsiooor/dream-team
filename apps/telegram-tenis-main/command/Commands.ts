import { CommandData } from './../types/CommandData';
import TelegramBot from "node-telegram-bot-api";
import {keyboardDefolt, keyboardHelp, keyboardRegisteredType } from "../kayboard/kayboard";
import { DBService } from "../repository/dbService";
import { User } from "../entities/User";
import { UserData } from "../types/UserData";

const DB = new DBService();
const UserService = DB.userService
const GameService = DB.gameService

export async function handleStartCommand(bot:TelegramBot,userData:UserData) {
    const user = new User()
    user.TelegramId = userData.userId
    user.username = userData.userFirstName
    await UserService.CreateUser(user);
    bot.sendMessage(userData.userId, `Добро пожаловать ${userData.userFirstName} в клуб великих тенесистов`);
    handleHelpCommand(bot,userData);
}
export function handleHelpCommand(bot:TelegramBot, userData:UserData) {  
    bot.sendMessage(userData.userId||0, 'Чего душе угодно ?', {
      reply_markup: keyboardHelp
    });
}
export function handleDefaultCommand(bot:TelegramBot,userData:UserData, CommandData: CommandData){
  bot.sendMessage(userData.userId,`is not correct command ${CommandData.command}`)
}
export async function handleRegisteredSelectTypeCommand(bot:TelegramBot,userData:UserData){

  // bot.sendPhoto(userData.userId, PathImages.registration, {
  //   caption: 'Регистрация матча'
  // });
  bot.sendMessage(userData.userId, 'Выберите режим:',{reply_markup: keyboardRegisteredType })
}
export async function handleRegisteredSelectEnemyCommand(bot:TelegramBot,userData:UserData){
  bot.sendMessage(userData.userId, 'Выберите противника:',{reply_markup: { inline_keyboard: await UserService.getUserButton(userData.userId)|| keyboardDefolt } })
}
export async function handleRegisteredAddEnemyCommand(bot:TelegramBot,userData:UserData, commandData: CommandData ){
  try{
    const enemyUser = await UserService.getUserById(parseInt(commandData.params[0]))
  bot.sendMessage(userData.userId, `Будет отправлен запрос на рейтинговый матч => ${enemyUser?.username}. Ожидайте подтверждения.`)
  if(enemyUser){
    const game = await GameService.createGameForTwoPlayers(enemyUser.TelegramId,userData.userId);    
    bot.sendMessage(enemyUser?.TelegramId, `Вас пытаються попустить готовы ли вы принять вызов от ${userData.userFirstName} ?`, {reply_markup: { inline_keyboard: [[{ text: 'Принять вызов', callback_data: `/yes ${userData.userId} ${game?.id}` },{ text: 'Отказать', callback_data: `/no ${userData.userId} ${game?.id}` }]]} })
  }  
  }
  catch(e){
    console.error('Error => handleRegisteredAddEnemyCommand',e)
  }  
}
export async function handleRegisteredHandlingCommand(bot:TelegramBot,userData:UserData, commandData: CommandData ){
  switch(commandData.command){
    case 'yes':
      bot.sendMessage(userData.userId, `Вы приняли вызов проследуйте к столу, после завершения игры нажмите на кнопку Завершить.`,
      {reply_markup: { inline_keyboard: [[{text:'Завершить.',callback_data: '/gg'}]]} })
      await GameService.AcceptGame(parseInt(commandData.params[1]))
      bot.sendMessage(commandData.params[0], `Ваш вызов принят ожидайте у стола, после завершения игры нажмите на кнопку Завершить.`,
      {reply_markup: { inline_keyboard: [[{text:'Завершить.',callback_data: '/gg'}]]} })
      
      break;
    case 'no':
      bot.sendMessage(userData.userId, `Вы отказали в матче, приятной работы :)`)
      await GameService.CancelGame(parseInt(commandData.params[1]))
      bot.sendMessage(commandData.params[0], `Вам было отказано в игре. В другой раз дружок.`)
      break;
  }
}
export async function handleGetRatingCommand(bot:TelegramBot,userData:UserData ){
  const AllUser = await UserService.getUsers();
  console.log('AllUSer',AllUser)
  const result = AllUser?.map(user=>{
  return `Имя: ${user.username}\n Количество игр: ${user.totalCount}\n Доля побед: ${user.winningPercentage + ' %'}\n======================\n`
  })
  const resultStr =result?.join('');
  bot.sendMessage(userData.userId, `Рейтинг учасников:\n======================\n${resultStr}`)
}
export async function handleGetMatchCommand(bot:TelegramBot,userData:UserData){
  bot.sendMessage(userData.userId, `В разработке`)
}
export async function handleGGGameCommand(bot:TelegramBot,userData:UserData, ){
  bot.sendMessage(userData.userId, 'Укажите свои победные очки матча в формате: /endGame 4')
}
export async function handleWinCommand(bot:TelegramBot,userData:UserData, commandData:CommandData){

  bot.sendMessage(userData.userId, 'Был отправлен запрос администратору на подтверждение игры.')
  const User1 = await UserService.getUserById(parseInt(commandData.params[0]));
  // const User2 = await UserService.getUserByTelegramId(parseInt(commandData.params[2]));
  const User2 = await UserService.getUserById(parseInt(commandData.params[1]));
  bot.sendMessage(683008996,`Состоялась игра:\n ${User1?.username}: ${commandData.params[0]} =WIN> ${User2?.username}: ${commandData.params[1]},`,{reply_markup: { inline_keyboard: [[{text:`Подтвердить`,callback_data:`/admin true ${User1?.id} ${User2?.id}`}],[{text:`Отменить`,callback_data:`/admin false ${User1?.id}`}]]|| keyboardDefolt } })
}
export async function handleEndGameCommand(bot:TelegramBot,userData:UserData) {
  
  bot.sendMessage(userData.userId,"Отправлен запрос на подтверждение результата,\n как только соигрок подтвердит результат вам придет уведомление \n об обновлении рейтинга.\n В РАЗРАБОТКЕ СОРИ, пока пинать Илью")
}
export async function handleAdminCommand(bot:TelegramBot,userData:UserData, commandData:CommandData){
  const User1 = await UserService.getUserById(parseInt(commandData.params[1]));
    const User2 = await UserService.getUserById(parseInt(commandData.params[2]));
    const isApproved = Boolean(commandData.params[0])
    if(User1?.TelegramId){
      if(User2){
        bot.sendMessage(userData.userId, `Укажите результат матчка в формате команды:\n id победителя :${User1?.id} \n id проигравшего ${User2?.id} \n /adden очкиПобедителя идИгока очкиПоражения идИгрока`)
        if(isApproved){
          bot.sendMessage(User1?.TelegramId,"Игра была подтверждена.")
          bot.sendMessage(User2?.TelegramId,"Игра была подтверждена.")
        }
        else{
          bot.sendMessage(User1?.TelegramId,'Администратор отменил матч')
          bot.sendMessage(User2?.TelegramId,'Администратор отменил матч')
        } 
      }   
    }    
}
export async function handleAddCommand(bot:TelegramBot,userData:UserData, commandData:CommandData){
  try{
      console.log('ADD COMMAND')
      const Winer = await UserService.getUserById(parseInt(commandData.params[1]));
      const NotWiner = await UserService.getUserById(parseInt(commandData.params[3]));
      const winerCount = parseInt(commandData.params[0])
      const notWinercount = parseInt(commandData.params[2])
      const User1 = new User();
    
      const User2 = new User();
      if(Winer&&NotWiner){
        
        User1.id = Winer?.id;
        User1.defeats = (Winer.defeats as number) + notWinercount;
        User1.victory = (Winer.victory as number) + winerCount;

        User2.id = NotWiner?.id;
        User2.defeats = (NotWiner.defeats as number) + winerCount;
        User2.victory = (NotWiner.victory as number) + notWinercount;

        UserService.UpdateUsers([User1,User2]);
        bot.sendMessage(userData.userId, 'Данные обновлены.')
      }
  }
  catch{
    bot.sendMessage(userData.userId, 'Error')
  }
  
  

}

export async function Test(bot:TelegramBot,userData:UserData) {
  const result = GameService.getGamesByUserId(userData.userId);
  console.log(await result)
  bot.sendMessage(userData.userId,`${result}`)
}