const MongoClient = require("mongodb").MongoClient;
const nearAPI = require("near-api-js");
const getConfig = require('./config');
const { CONTRACT_ID, networkId, GAS, contractMethods, GUESTS_ACCOUNT_SECRET, MONGO_URI } = getConfig();
const { checkGuest, checkAccount, addKey, createGuestUser } = require('./utils/near-utils');

const mongoClient = new MongoClient(MONGO_URI);

async function mongoConnect() {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("bot");
        const collection = db.collection("users");
        return collection
    }catch(err) {
        console.log(err);
    }
}

module.exports = {

    UserCreate: async function (userId, accountId, publicKey, secretKey) { 
        collection = await mongoConnect()

        try{
            await addKey(publicKey)
            await createGuestUser(accountId, publicKey)
            return await collection.insertOne({
                userId,
                accountId,
                publicKey,
                secretKey,
                // 'signIn': true,
                // 'guest': true
            });

        } catch(e) {
            throw e
        }

        
    },

    GuestUserCreate: async function (userId, accountId, publicKey, secretKey) { 
        collection = await mongoConnect()

        try{
            await addKey(publicKey)
            return await collection.insertOne({
                userId,
                accountId,
                publicKey,
                secretKey,
                // 'signIn': true,
                // 'guest': true
            });

        } catch(e) {
            throw e
        }

        
    },

    GetOrCreateUser: async function (userId) { 
        try {    
            collection = await mongoConnect()
            let user = await collection.findOne({'userId': userId});
            const account_id = userId + '.' + CONTRACT_ID

            if (user){
                return user

            } else {
                const keypair = nearAPI.utils.KeyPair.fromRandom('ed25519')
                const publicKey = keypair.publicKey.toString();
                const secretKey = keypair.secretKey;
                console.log(secretKey)

          
                try{
                    console.log('\nAdding guest account:', account_id)
                    await createGuestUser(account_id, publicKey)
                } catch(e){
                    console.log(typeof e.message)
                    console.log(e.message)
                    console.log(typeof JSON.parse(e.message))
                    console.log(JSON.parse(e.message))
                    console.log(JSON.parse(e.message).kind.ExecutionError)
                    
                } finally{
                    await addKey(publicKey)

                    user = await collection.insertOne({
                        userId,
                        publicKey,
                        secretKey,
                        'accountId': account_id,
                        'login': true,
                        'guest': true
                    });

                }
              
                return user
            }
            
        }catch(e){
            throw e
        } finally {
            await mongoClient.close();
        }
    },

    UserGet: async function (userId) {
        try {    
            collection = await mongoConnect()
            let user = await collection.findOne({'userId': userId});

            if (user){
                return user
            } else {
                throw new Error('User not found')
            }
        }catch(e){
            throw e
        } finally {
            await mongoClient.close();
        }
    },

    UserUpdate: async function (userId, data) {
        try {   
            collection = await mongoConnect()
            user = await collection.updateOne({userId}, {$set: data})
            console.log(user)
            return user

        } finally {
            await mongoClient.close();
        }
    },

    UserDelete: async function (userId) {
        try {
            collection = await mongoConnect()
            await collection.deleteOne({'userId': userId});
        }catch(e){
            throw e
        }finally {
            await mongoClient.close();
        }
    },
}