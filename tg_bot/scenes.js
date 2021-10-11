const {Scenes: {WizardScene, Stage, BaseScene} } = require('telegraf')
const nearAPI = require("near-api-js");
const keyboard = require('./keyboard')
const {UserGetOrCreate, UserUpdate, UserCreate, UserGet} = require('./database');
const {getContract, addFunctionAccessKey, checkAccount} = require('./utils/near-utils');
const getConfig = require('./config');
const {CONTRACT_ID} = getConfig();

const bot_url = 'https://t.me/near_nft_bot'

function isValidHttpUrl(string) {
    try {
      new URL(string);
      return true
    } catch (_) {
      return false;  
    }
  }

  const loginScene = new WizardScene(
    'loginScene',
    async ctx => {
        let user = await UserGet(ctx.chat.id)
        if (user) {
            ctx.reply(`You are already logged in. Account: ${user.accountId} Run /logout if you want to log in with a different account`)
        } else {
            ctx.reply("Send you username");
            ctx.wizard.state.data = {};
            return ctx.wizard.next();
        }
        
    },
    async ctx => {
        const account_id = ctx.wizard.state.data.accountId = ctx.message.text +  '.' + CONTRACT_ID;

        // const account_id = ctx.message.text +  '.' + CONTRACT_ID
        // keypair = ctx.wizard.state.data.keypair = nearAPI.utils.KeyPair.fromRandom('ed25519')
        // publicKey = ctx.wizard.state.data.publicKey = keypair.publicKey.toString();
        // privateKey = ctx.wizard.state.data.privateKey = keypair.secretKey;
        
        // const account = await near.account(CONTRACT_ID);
        // await keyStore.setKey(config.networkId, publicKey, keyPair);
        // await account.addKey(publicKey, authorizedContract, methods, allowance);

        console.log(account_id)
        if (await checkAccount(account_id)) {
            ctx.reply(
            `Approve you wallet in smart contract. Then click confirm.\nhttps://wallet.betanet.near.org/login/?success_url=${bot_url}&contract_id=${CONTRACT_ID}&public_key=${publicKey}`,
             keyboard.confirm
             );
            return ctx.wizard.next();
        }
        else {
            try{
                await UserCreate(ctx.chat.id, ctx.message.text)

                await ctx.reply('Login succes')
            } catch(e){

                await ctx.reply(e.message)
                return ctx.scene.leave()
            }
        }
        // ctx.reply(
        //     `Approve you wallet in smart contract. Then click confirm.\nhttps://wallet.betanet.near.org/login/?success_url=${bot_url}&contract_id=${CONTRACT_ID}&public_key=${publicKey}`,
        //      keyboard.confirm
        //      );
        // return ctx.wizard.next();
    },
    // async ctx => {
    //     if (ctx.callbackQuery.data === 'confirm'){
    //         await ctx.answerCbQuery('Confirm')
    //         await addFunctionAccessKey(ctx.wizard.state.data.accountId, ctx.wizard.state.data.keypair, ctx.wizard.state.data.publicKey)
    //         // const data = {
    //         //     'accountId': ctx.wizard.state.data.accountId ,
    //         //     'guest': false,
    //         //     'publicKey': ctx.wizard.state.data.publicKey,
    //         //     'privateKey': ctx.wizard.state.data.privateKey,
    //         // }
    //         // user = await UserUpdate(ctx.chat.id, data)
    //         await ctx.editMessageText('Login success')
    //     } else {
    //         await ctx.answerCbQuery('Cancel')
    //         await ctx.editMessageText('Run the command')
    //     }
    //     return ctx.scene.leave()
    // }
);

const mintScene = new WizardScene(
    'mintScene',
    async ctx => {
        ctx.reply("Send url image you nft");
        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    async ctx => {
        if (isValidHttpUrl(ctx.message.text)) {
            ctx.wizard.state.data.imageUrl = ctx.message.text;
            ctx.reply('Enter description for image');
            return ctx.wizard.next();
        } else if (ctx.message.photo){
            ctx.reply('This function in develop. Please send url image')
            console.log(ctx.message.photo)
            // let url = `https://api.telegram.org/bot${token}/getFile?file_id=${ctx.photo.file_id}`;
        } else {
            ctx.reply('Invalid url. Try again');
            // return ctx.wizard.selectStep(ctx.wizard.cursor);
        }
    },
    async ctx => {
        if (ctx.message.text) {
            ctx.wizard.state.data.description = ctx.message.text;
            ctx.reply(`Please confirm or cancel you mint nft.\nUrl image: ${ctx.wizard.state.data.imageUrl}\nDescription: ${ctx.wizard.state.data.description}`,
            keyboard.confirm
            );
            return ctx.wizard.next();
        } else {
            ctx.reply('Invalid description. Please enter text');
        }
    },
    async ctx => {
        if (ctx.callbackQuery.data === 'confirm'){
            await ctx.answerCbQuery('confirm')
            user = await UserGetOrCreate(ctx.chat.id)
            console.log(user)
            // getContract()
            // account = 
            // await contract[!account ? 'nft_mint_guest' : 'nft_mint']({
            //     token_id: 'token-' + Date.now(),
            //     metadata,
            // }, GAS, deposit);
        } else {
            await ctx.answerCbQuery('cancel')
        }
        // console.log(ctx.callbackQuery)
        // return ctx.scene.leave()
    }
);


module.exports.mintScene = mintScene;
module.exports.loginScene = loginScene;

