// const {keyboard, inlineKeyboard, callbackButton, removeKeyboard} = require('telegraf')
const {Markup} = require('telegraf')

const exit = Markup.keyboard(['exit']).oneTime()
//  = Markup.keyboard(['confirm', 'cancel']).oneTime()
const confirm = Markup.inlineKeyboard([
    Markup.button.callback('Confirm', 'confirm'),
    Markup.button.callback('Cancel', 'cancel'),
])
const remove = Markup.removeKeyboard()

module.exports.exit = exit;
module.exports.confirm = confirm;
module.exports.remove = remove;