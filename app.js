const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

// ================================================================================================================

client.on('authenticated', (session) => {
    console.log("Authenticated Using local session");
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
    console.log('For run this app in the background,\nTry to learn using tmux and start it in Tmux Session');

});

client.on('message', async message => {
    const jam = new Date().getHours() + 7;
    const chat = await message.getChat();

    // MSG Logger, for incident handling
    console.log('MSG Received');
    console.log("[*] " + message.from + " =[ " + jam + " ]==> " + message.body);

    let msgx = message.body

    // check if message from groupchat
    if(chat.isGroup){
        const authorId = message.author;
        for(let participant of chat.participants) {
            if(participant.id._serialized === authorId && participant.isAdmin) {
                if(msgx === '!help'){
                    message.reply('Halo Admin, ini adalah menu Admin');
                }
            } else if(participant.id._serialized === authorId && !participant.isAdmin){
                if(msgx === '!help'){
                    message.reply('Halo Member, ini adalah menu Admin');
                }
            }
        }
    } else if(!chat.isGroup){
        if(msgx === '!help'){
            message.reply('Halo User, ini adalah menu Admin');
        }
    }


    if(msgx === '!halo') {
        if(jam < 12){
            message.reply('Hai Haloooo, Selamat Pagi. Kenalin aku Bot yang dikembangin sama encrypt0r dengan library wwebjs');
        } else if( jam < 16){
            message.reply('Hai Haloooo, Selamat Siang. Kenalin aku Bot yang dikembangin sama encrypt0r dengan library wwebjs');
        } else if(jam < 19){
            message.reply('Hai Haloooo, Selamat Sore. Kenalin aku Bot yang dikembangin sama encrypt0r dengan library wwebjs');
        } else {
            message.reply('Hai Haloooo, Selamat Malam. Kenalin aku Bot yang dikembangin sama encrypt0r dengan library wwebjs');
        }
    }

    if(msgx.indexOf('!tagsemua') > -1) {
        let text = msgx.slice(10) + "\n";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }

    if(msgx.indexOf('!tambahkeun') > -1){
        let tampungString = msgx.slice(12);
        var arrNomor = tampungString.split(" ")
        var nmr = []
        for(let xyz of arrNomor){
             if(await client.isRegisteredUser(xyz)){
                 const kontaq = await client.getNumberId(xyz)
                 const idNomor = await client.getContactById(kontaq._serialized)
                 nmr.push(idNomor.id._serialized)
                 console.log("[*] " + xyz + " Registered")
             } else{
                 console.log("[!] " + xyz + " Not Registered!")
             }
        }
        await chat.addParticipants(nmr)
    }

    if(msgx === '!stickerize') {
        if(message.hasMedia) {
            const sticker = await message.downloadMedia();
            const file = new MessageMedia('image/webp', sticker.data, 'img.webp');
            client.sendImageAsSticker(message.from, file);
        }
    }

});

client.initialize();
