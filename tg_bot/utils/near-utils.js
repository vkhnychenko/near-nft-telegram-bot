const nearAPI = require('near-api-js');
const { utils: { format: { parseNearAmount } } } = nearAPI;
const getConfig = require('../config');
const { CONTRACT_ID, networkId, nodeUrl, walletUrl, contractMethods,
    ALLOWANCE, GUESTS_ACCOUNT_SECRET, DEFAULT_NEW_ACCOUNT_AMOUNT, CONTRACT_PRIVATE_KEY, GAS } = getConfig();

async function connectNear(){
    return await nearAPI.connect({networkId, nodeUrl, walletUrl, deps: {keyStore: new nearAPI.keyStores.InMemoryKeyStore()}});
}

async function createAccount(accountId, fundingAmount = DEFAULT_NEW_ACCOUNT_AMOUNT, secretKey) {
    near = await connectNear()

    const contractKeyPair =  nearAPI.utils.KeyPair.fromString(CONTRACT_PRIVATE_KEY);
    near.connection.signer.keyStore.setKey(networkId, CONTRACT_ID, contractKeyPair);

    const contractAccount = new nearAPI.Account(near.connection, CONTRACT_ID);

    const KeyPair = secretKey ? nearAPI.utils.KeyPair.fromString(secretKey) : nearAPI.utils.KeyPair.fromRandom('ed25519');

    await contractAccount.createAccount(accountId, KeyPair.publicKey, parseNearAmount(fundingAmount));
    near.connection.signerkeyStore.setKey(networkId, accountId, KeyPair);

    return new nearAPI.Account(near.connection, accountId);
}

async function initContract(account, contract) {
	/// try to call new on contract, swallow e if already initialized
	try {
        const newArgs = {
			owner_id: account.accountId,
		};
		await contract.new(newArgs);
	} catch (e) {
		if (!/initialized/.test(e.toString())) {
			throw e;
		}
	}
}

async function getContractAccount() {
    near = await connectNear()

    const keyPair =  nearAPI.utils.KeyPair.fromString(CONTRACT_PRIVATE_KEY);
    near.connection.signer.keyStore.setKey(networkId, CONTRACT_ID, keyPair);

    return new nearAPI.Account(near.connection, CONTRACT_ID);
}

async function getContract(methods = contractMethods) {
    const account = await getContractAccount()
    const contract =  new nearAPI.Contract(account, CONTRACT_ID, {...methods});

    await initContract(account, contract)
    return contract
}

async function getAccount(accountId, privateKey){
    near = await connectNear()
    const keyPair =  nearAPI.utils.KeyPair.fromString(privateKey);
    near.connection.signer.keyStore.setKey(networkId, accountId, keyPair);
    
    return new nearAPI.Account(near.connection, accountId)
}

async function createGuestAccount(secretKey) {
    near = await connectNear()

    near.connection.signer.keyStore.setKey(networkId, 'guests.' + CONTRACT_ID, secretKey);
    return new nearAPI.Account(near.connection, 'guests.' + CONTRACT_ID);
}

async function addKey(public_key) {
    const guestsAccount = await createGuestAccount(GUESTS_ACCOUNT_SECRET)
    const res = await guestsAccount.addKey(public_key, CONTRACT_ID, contractMethods.changeMethods, parseNearAmount('0.1'));

    console.log(res)
}

async function createAccessKeyAccount(secretKey) {
    near = await connectNear()
    near.connection.signer.keyStore.setKey(networkId, CONTRACT_ID, secretKey);
    return new Account(near.connection, CONTRACT_ID);
}

async function checkGuest(public_key) {
    const account = await getContractAccount()

    try {
        const res = await account.viewFunction(CONTRACT_ID, 'get_guest', { public_key});
        console.log(res);
        return true
    } catch (e) {
        return false
    }
}

async function checkAccount(account_id) {
    const account = await getContractAccount()

    try {
        const res = await account.viewFunction(CONTRACT_ID, 'get_account', { account_id});
        console.log(res);
        return true
    } catch (e) {
        return false
    }
}

async function createGuestUser(account_id, public_key) {

    const guestsAccount = await createGuestAccount(GUESTS_ACCOUNT_SECRET)
    const contract = await getContract()

    try {
        // const addKey = await guestsAccount.addKey(public_key, CONTRACT_ID, contractMethods.changeMethods, parseNearAmount('0.1'));
        // console.log(addKey)
        console.log('-----------------------------------------')
        const res = await contract.add_guest({ account_id, public_key }, GAS);
        console.log(res)
    } catch(e) {
        throw e
    }

}

async function upgradeGuest(user) {
    //the new full access key
    const { seedPhrase, publicKey } = generateSeedPhrase();
    console.log(seedPhrase)

    console.log(user.secretKey)

    // const keyPair = KeyPair.fromRandom('ed25519');
    // const keyPair2 = KeyPair.fromRandom('ed25519');
    // const public_key = keyPair.publicKey.toString();
    // const public_key2 = keyPair2.publicKey.toString();
    const guestAccount = await createGuestAccount(user.secretKey);

    // connection.signer.keyStore.setKey(networkId, bobId, keyPair);

    const public_key = publicKey.toString();
    const access_key = user.publicKey.toString();

    const result = await guestAccount.functionCall(CONTRACT_ID, 'upgrade_guest', {
        public_key,
        access_key: access_key,
        method_names: '',
    }, GAS);
    console.log(result);

    return seedPhrase
}

async function mintNFT(user, image_url) {

    try {
        if (user.guest) {
            const token_id = 'token' + Date.now()

            console.log(user)
            const account = await getAccount('guests.' + CONTRACT_ID, user.secretKey.split(':')[1])
            res = await account.functionCall(CONTRACT_ID, 'nft_mint_guest', {token_id, metadata: image_url}, GAS)

            console.log(res)

        } else if (!user.guest){
            console.log('sfdsfsdf')
            // console.log(user.accountId)
            // console.log(user.privateKey)
            // console.log('----------------------------------')
            // const account = await getAccount(user.accountId, user.privateKey)
            // console.log(account)
            // res = await account.state()
            // console.log(res)
            // const contract = await getContract(account)

            // const token_id = 'token' + Date.now()
            // console.log(token_id)

            // res = await contract.nft_mint({ token_id, metadata: image_url }, GAS, nearAPI.utils.format.parseNearAmount('0.2'));
            // console.log(res)


            // const token = await contract.nft_token({ token_id });
            // console.log(token)
            // console.log(token.owner_id)
    
            // const res = await account.functionCall(contract.accountId, 'nft_mint', {token_id: token_id, metadata: image_url}, GAS, nearAPI.utils.format.parseNearAmount('1'));
            // console.log(res)
        }
    } catch(e) {
        console.log(e)
        throw new Error('Call contract error')
    }

}

module.exports.checkGuest = checkGuest;
module.exports.checkAccount = checkAccount;
module.exports.createGuestUser = createGuestUser;
module.exports.addKey = addKey;