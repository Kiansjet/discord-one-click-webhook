// Dependencies
let discord = require('discord.js')
let prompt = require('prompt')
let events = require('events')
let os = require('os')

// Global variables
let webhook
let loopEvent = new events.EventEmitter()

function pressKeyToExit() {
    console.log('\nPress any key to exit')

    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.on('data', process.exit.bind(process, 0))
}

console.log('Welcome to Kian\'s one-click-webhook!\n')

prompt.start({noHandleSIGNINT: true}) // SIGINT is the ctrl c thing to escape
prompt.message = ''
let webhookPromptSchema = {
    properties: {
        'Webhook ID': {
            required: true,
            pattern: /^\d+$/,
            message: 'Webhook ID is the number from the earlier part of the URL.',
        },
        'Webhook Token': {
            required: true,
            pattern: /[a-zA-Z0-9]+/,
            message: 'Webhook Token is the longer string from the later part of the URL.',
        },
    }
}
let textMessagePromptSchema = {
    properties: {
        'Message': {
            required: true,
            pattern: /./,
            message: 'Type something lol'
        }
    }
}

process.on('SIGINT',function() {
    process.exit() // dab and close immediately
})

loopEvent.on('loop',function() {
    prompt.get(textMessagePromptSchema,async function(err,result) {
        console.log('Sending...')

        await webhook.send(result.Message).then(function(message) {
            console.log('Sent: '+message.content+'\n')
        }).catch(function(err) {
            console.log('Error. Sending failed.\n'+err)
            pressKeyToExit()
        })
        loopEvent.emit('loop')
    })
})

prompt.get(webhookPromptSchema,async function(err,result) {
    console.log('\nConnecting...')

    webhook = new discord.WebhookClient(result['Webhook ID'],result['Webhook Token'])
    
    await webhook.send('one-click-webhook connected from '+os.hostname()).then(function() {
        console.log('Connection Successful!\n')
        loopEvent.emit('loop')
    }).catch(function(err) {
        console.log('Connection failed.\n'+err)
        pressKeyToExit()
    })
})

// Due to a lack of documentation, here are the events the prompt EventEmitter can emit:
// start
// pause
// resume
// stop
// prompt
// invalid