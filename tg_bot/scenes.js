const {Scenes: {WizardScene, Stage, BaseScene} } = require('telegraf')
const nearAPI = require("near-api-js");
const keyboard = require('./keyboard')
const {UserGetOrCreate, UserUpdate, UserCreate, UserGet, UserDelete} = require('./database');
const {getContract, checkAccount, checkGuest, mintNftGuest, mintNft} = require('./utils/near-utils');
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
        try {
            console.log(ctx.chat.id)
            let user = await UserGet(ctx.chat.id)    
            ctx.reply(`You are already logged in.\nAccount: ${user.accountId}\nRun command /logout if you want to log in with a different account`)
            
            return ctx.scene.leave()
        } catch(e){
            if (e.message === 'User not found'){
                await ctx.reply("Send you username");
                ctx.wizard.state.data = {};
                return ctx.wizard.next();
            } else {
                await ctx.reply(e.message)
                return ctx.scene.leave()
            }
            
        }
        
    },
    async ctx => {
        if (ctx.message.text.search(/^[a-zA-Z0-9_]+$/) != -1) {
            const accountId = ctx.wizard.state.data.accountId = ctx.message.text +  '.' + CONTRACT_ID;
            const keypair = ctx.wizard.state.data.keypair = nearAPI.utils.KeyPair.fromRandom('ed25519')
            const publicKey = ctx.wizard.state.data.publicKey = keypair.publicKey.toString();
            const secretKey = ctx.wizard.state.data.secretKey = keypair.secretKey;
            console.log(accountId)

            // const account_id = username + '.' + contractName
            // const contractAccount = new Account(near.connection, contractName)
            //     try {
            //     await contractAccount.viewFunction(contractName, 'get_account', { account_id })
            // return alert('username taken')
            if (await checkAccount(accountId)) {
                ctx.reply('Username taken. Try again')
                return ctx.wizard.selectStep(ctx.wizard.cursor);
                // ctx.reply(
                // `Approve you wallet in smart contract. Then click confirm.\nhttps://wallet.betanet.near.org/login/?success_url=${bot_url}&contract_id=${CONTRACT_ID}&public_key=${publicKey}`,
                //  keyboard.confirm
                //  );
                //return ctx.wizard.next();
            }
            else {
                try{
                    await UserCreate(ctx.chat.id, accountId, publicKey, secretKey)
    
                    await ctx.reply('Login succes')
                } catch(e){
                    await ctx.reply(e.message)
                }
            }

            return ctx.scene.leave()
            
        } else {
            ctx.reply('Username error. Try again')
            return ctx.wizard.selectStep(ctx.wizard.cursor);
        }
        
        
    },
    async ctx => {
        if (ctx.callbackQuery.data === 'confirm'){
            try{
                await ctx.answerCbQuery('Confirm')
                await UserCreate(ctx.chat.id, ctx.wizard.state.data.accountId, ctx.wizard.state.data.publicKey, ctx.wizard.state.data.secretKey)
                await ctx.editMessageText('Login success')

            } catch(e){
                await ctx.reply(e.message)
            }
        } else {
            await ctx.answerCbQuery('Cancel')
            await ctx.editMessageText('Run the command')
        }
        return ctx.scene.leave()
    }
);

const logoutScene = new WizardScene(
    'logoutScene',
    async ctx => {
        ctx.reply( `WARNING If logout you will lose access to the account`, keyboard.confirm)
        return ctx.wizard.next();
    },
    async ctx => {
        if (ctx.callbackQuery.data === 'confirm'){
            try{
                await ctx.answerCbQuery('Confirm')
                await UserDelete(ctx.chat.id)
                ctx.reply('Logout succes')
        
            } catch(e) {
                ctx.reply(e.message)
            }
        } else {
            await ctx.answerCbQuery('Cancel')
            await ctx.editMessageText('Run the command')
        }
        return ctx.scene.leave()
    }
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
            ctx.reply(`Please confirm or cancel you mint nft.\nImage: ${ctx.message.text}`, keyboard.confirm);
            return ctx.wizard.next();
        } else if (ctx.message.photo){
            ctx.reply('This function in develop. Please send url image')
            console.log(ctx.message.photo)
            // let url = `https://api.telegram.org/bot${token}/getFile?file_id=${ctx.photo.file_id}`;
        } else {
            ctx.reply('Invalid url. Try again');
            // return ctx.wizard.selectStep(ctx.wizard.cursor);
        }
        
        return ctx.wizard.selectStep(ctx.wizard.cursor);
    },

    async ctx => {
        if (ctx.callbackQuery.data === 'confirm'){

            try{
                await ctx.answerCbQuery('Confirm')
                user = await UserGet(ctx.chat.id)
                if (await checkGuest(user.publicKey)) {
                    await mintNftGuest(user.secretKey, ctx.wizard.state.data.imageUrl)
                    ctx.reply('Mint success')
                } else {
                    ctx.reply('User not guest. Mint is temporarily unavailable')
                }

            } catch(e) {
                ctx.reply(e.message)
            }
        } else {
            await ctx.answerCbQuery('Cancel')
            await ctx.editMessageText('Run the command')
        }
        return ctx.scene.leave()
    }
);


module.exports.mintScene = mintScene;
module.exports.loginScene = loginScene;
module.exports.logoutScene = logoutScene;
