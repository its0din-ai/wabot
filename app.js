const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

// ================================================================================================================

client.on('authenticated', (session) => {
    console.log("AUTHENTICATED", session);
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
    console.log('User CTRL+Z to suspend, then type bg \nto make this program runs in the background');

});

client.on('message', async message => {
    console.log('MSG');
    let msgx = message.body
    if(message.body === '!hello') {
        const jam = new Date().getHours() + 7;
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
        const chat = await message.getChat();
        let text = msgx.slice(10) + "\n";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }

    if(message.body === '!stickerize') {
        if(message.hasMedia) {
            const sticker = await message.downloadMedia();
            const file = new MessageMedia('image/webp', sticker.data, 'img.webp');
            client.sendImageAsSticker(message.from, file);
        }
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
        const codes = await message.getChat()
        await codes.addParticipants(nmr)
    }

});

client.initialize();
