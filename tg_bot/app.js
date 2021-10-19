const { Telegraf, session, Scenes: {Stage},  } = require('telegraf')
const scenes = require('./scenes')
const keyboard = require('./keyboard')
const {test, getAccount, getContract, addFunctionAccessKey, connectNear, checkAccount, checkGuest} = require('./utils/near-utils');
const { AccountDoesNotExist } = require('near-api-js/lib/generated/rpc_error_types');
const nearAPI = require('near-api-js');
const {SetUser, SetUserGuest, UserDelete, UserUpdate, GetOrCreateUser, UserGet} = require('./database');
const getConfig = require('./config');
const { networkId, GAS, contractMethods, GUESTS_ACCOUNT_SECRET, nodeUrl, walletUrl, CONTRACT_ID, TELEGRAM_TOKEN, BOT_URL } = getConfig();

const bot = new Telegraf(TELEGRAM_TOKEN)

const image_url = 'https://ibb.co/XJyGLV3'

const stage = new Stage([scenes.mintScene, scenes.loginScene, scenes.logoutScene])
stage.hears('exit', ctx => ctx.scene.leave())

bot.use(session())
bot.use(stage.middleware())

bot.command('start', async (ctx) =>  {
   
    ctx.reply(`Start ${ctx.chat.first_name}`)


})

bot.command('login', async (ctx) => ctx.scene.enter('loginScene'))
bot.command('logout', async (ctx) => ctx.scene.enter('logoutScene'))

bot.command('user', async (ctx) => {
    try {
        user = await GetUser(ctx.chat.id)
        ctx.reply(user)
        // await MintNFT(user, image_url)
    } catch(e) {
        ctx.reply(e.message)
    }
})
bot.command('upgrade', async (ctx) => {
    console.log(ctx.chat.id)
    user = await HandeCreateGuest(ctx.chat.id)
    seed_phrase = await UpgradeGuest(user)
    ctx.reply(`Seed phrase:${seed_phrase}`)
})
bot.command('mint', async (ctx) => ctx.scene.enter('mintScene'))
// bot.command('mint', async (ctx) => {

//     try {
//         user = await GetUser(ctx.chat.id)
//         ctx.reply(user)
//         // await MintNFT(user, image_url)
//     } catch(e) {
//         ctx.reply(e.message)
//     }
    
//     // ctx.reply('test')
//     // metadata = {}
//     // const add_guest = await contractAccount.functionCall(CONTRACT_ID, 'add_guest', { account_id, public_key }, GAS);
//     // console.log(account.getAccountBalance())
//     // const contract = await getContract(account)
//     // const res = await contract['nft_mint_guest']
//     // console.log(res)
// })
bot.command('check_guest', async (ctx) => {
    console.log(ctx.chat.id)
    // const account_id = ctx.chat.id + '.' + CONTRACT_ID
    try {
        user = await UserGet(ctx.chat.id)
        console.log(await checkGuest(user.publicKey))
    } catch(e) {
        ctx.reply(e.message)
    }
})

bot.command('check_account', async (ctx) => {
    const account_id = ctx.chat.id +  '.' + CONTRACT_ID
    console.log(account_id)
    console.log(await checkAccount(account_id))
    // try {
    //     user = await HandeCreateGuest(ctx.chat.id)
    //     console.log(await checkAccount(user.accountId))
    // } catch(e) {
    //     ctx.reply(e.message)
    // }
})
bot.command('gallery', async (ctx) => ctx.reply('gallery'))
bot.command('market', async (ctx) => ctx.reply('market'))
bot.command('delete', async (ctx) => {
    await UserDelete(ctx.chat.id)
    ctx.reply('delete succeful')
})
bot.command('test', async (ctx) => {
    console.log(CONTRACT_ID)
    console.log(networkId)
    console.log(BOT_URL)
    // let {publicKey, privateKey} = await addFunctionAccessKey('vkhnychenko.betanet')
    // console.log(publicKey)
    // console.log(privateKey)
    // const account = await getAccount(accountId, accountPrivateKey)
    // account.sendMoney(CONTRACT_ID, '10000000000000000000')
    // try {
    //     user = await UserGetOrCreate(ctx.chat.id)
    //     ctx.reply(user)
    // } catch(e) {
    //     ctx.reply(e.message)
    // }

    // const publicKey = 'ed25519:62WzTozPW3pV6AWXWK7LFDvqjNXM8f33C3yXJGooA1oe'


    // const near = await nearAPI.connect(config);

    // const account = await near.account(accountId);
    // console.log(account)

    // await keyStore.setKey(config.networkId, publicKey, keyPair);
    // console.log('----------------------------------')
    // // await account.addKey(publicKey, CONTRACT_ID, METHODS, ALLOWANCE);
    // console.log(publicKey)
    // ctx.reply(`https://wallet.betanet.near.org/login/?success_url=${bot_url}&contract_id=${CONTRACT_ID}&public_key=${publicKey}`)
    
})

bot.command('add', async (ctx) => {
    const near = await nearAPI.connect(config);
    const account = await near.account(accountId);

    console.log(accountId)
    const struct = await account.getAccountDetails()
    const publicKey = struct.authorizedApps[1].publicKey

    // const keyPair = nearAPI.utils.KeyPair.fromRandom("ed25519")
    // await keyStore.setKey(config.networkId, publicKey, keyPair);
    console.log(CONTRACT_ID)
    resp = await account.addKey('ed25519:62WzTozPW3pV6AWXWK7LFDvqjNXM8f33C3yXJGooA1oe', CONTRACT_ID, METHODS, ALLOWANCE);
    console.log(resp)
})

bot.command('minttest', async (ctx) => {
    // console.log(user.accountId)
    // console.log(user.privateKey)
    // privateKey = 
    // console.log('----------------------------------')
    // const account = await getAccount(user.accountId, user.privateKey)
    // console.log(account)
    // const account = await getAccount('vkhnychenko.betanet', privateKey);

    // res = await account.state()
    // console.log(res)
    // const contract = await getContract(account)
    // console.log(contract)

    const token_id = 'token' + Date.now()
    console.log(token_id)

    const near = await nearAPI.connect(config);

    const account = await near.account(accountId);
    // res = await contract.nft_mint({ token_id, metadata: image_url }, GAS, nearAPI.utils.format.parseNearAmount('0.2'));
    // console.log(res)


    // const token = await contract.nft_token({ token_id });
    // console.log(token)
    // console.log(token.owner_id)

    // const res = await account.functionCall(CONTRACT_ID, 'nft_token', {token_id: token_id}, GAS);
    // console.log(res)

    const res = await account.functionCall(CONTRACT_ID, 'nft_mint', {token_id: token_id, metadata: image_url}, GAS, nearAPI.utils.format.parseNearAmount('0.2'));
    console.log(res)
    
})

bot.command('updatetest', async (ctx) => {
    // const account = await getAccount(accountId, accountPrivateKey)
    // account.sendMoney(CONTRACT_ID, '10000000000000000000')
    try {
        data = {'accountId': 'fsfdsf', 'privateKey': 'fsdfdsfsf'}
        user = await UserUpdate(ctx.chat.id, data)
        ctx.reply(user)
    } catch(e) {
        ctx.reply(e.message)
    }
    
})

bot.launch()
