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
    const tanggal = new Date();
    const chat = await message.getChat();

    // MSG Logger, for incident handling
    console.log('MSG Received');
    console.log("[*] " + message.from + " =[ " + tanggal.toLocaleString() + " ]==> " + message.body);

    let msgx = message.body

    // check if message from groupchat
    if(chat.isGroup)
    {
        const authorId = message.author;
        for(let participant of chat.participants) {
            if(participant.id._serialized === authorId && participant.isAdmin) {
                // Menu eksklusif admin ada disini
                if(msgx === '!help'){
                    message.reply('Halo Admin, ini adalah menu Bot: \n!halo \n!tagsemua [pesan] \n!stickerize \n!tambahkeun [nomor1],[nomor2],..');
                }

                if(msgx.indexOf('!tambahkeun') > -1){
                    let tampungString = msgx.slice(12);
                    var arrNomor = tampungString.split(",")
                    var nmr = []
                    var gagal = []
                    for(let xyz of arrNomor){
                         if(await client.isRegisteredUser(xyz)){
                             const kontaq = await client.getNumberId(xyz)
                             const idNomor = await client.getContactById(kontaq._serialized)
                             nmr.push(idNomor.id._serialized)
                             console.log("[*] " + xyz + " Registered")
                         } else{
                             console.log("[!] " + xyz + " Not Registered!")
                             gagal.push(xyz)
                         }
                    }
                    // handle if nmr is empty array
                    if(nmr.length > 0){
                        await chat.addParticipants(nmr)
                    }
                    if(gagal.length > 0){
                        message.reply("Nomor yang tidak terdaftar di Whatsapp: " + gagal)
                    }

                }

                if(msgx.indexOf('!kick') > -1){
                    chat.send(typeof(message.mentionedIds) + "\n" + message.mentionedIds)

                }


            } else if(participant.id._serialized === authorId && !participant.isAdmin){
                if(msgx === '!help'){
                    message.reply('Halo Member, ini adalah menu Bot: \n!halo \n!tagsemua [pesan]');
                }



                // Error Catcher
                if(msgx === '!stickerize') {
                    message.reply("Maaf, konversi ke Sticker hanya dapat dilakukan melalui Private Chat")
                }
            }
        }

        // Menu manajemen Group ada disini (Selain Admin)

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

    }
    else if(!chat.isGroup)
    {
        // Menu yang hanya bisa diakses melalui Private Chat
        if(msgx === '!help'){
            message.reply('Halo User, ini adalah menu Bot: \n!halo \n!stickerize');
        }

        if(msgx === '!stickerize') {
            if(message.hasMedia) {
                const sticker = await message.downloadMedia();
                chat.sendMessage(sticker, { sendMediaAsSticker: true, stickerAuthor: 'encrypt0r-bot', stickerName: 'sticker'});
            }
        }



        // Error Catcher
        if(msgx.indexOf('!tagsemua') > -1) {
            message.reply("Maaf, perintah ini hanya dapat digunakan di Group Chat")
        }
    }

    // Menu yang bisa diakses semua ada disini

    if(msgx === '!halo') {
        if(tanggal.getHours() < 12){
            message.reply('Hai Haloooo, Selamat Pagi. Kenalin aku Bot yang dikembangin sama encrypt0r dengan library wwebjs');
        } else if( tanggal.getHours() < 16){
            message.reply('Hai Haloooo, Selamat Siang. Kenalin aku Bot yang dikembangin sama encrypt0r dengan library wwebjs');
        } else if(tanggal.getHours() < 19){
            message.reply('Hai Haloooo, Selamat Sore. Kenalin aku Bot yang dikembangin sama encrypt0r dengan library wwebjs');
        } else {
            message.reply('Hai Haloooo, Selamat Malam. Kenalin aku Bot yang dikembangin sama encrypt0r dengan library wwebjs');
        }
    }








    // Playground
    if(msgx.indexOf('!getdata') > -1){
        console.log("\n" + message.mentionedIds)
    }


});

client.initialize();
