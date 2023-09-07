const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

// ================================================================================================================

client.on('authenticated', () => {
    console.log("Authenticated Using local session");
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
    console.log('For run this app in the background,\nTry to learn using tmux and start it in Tmux Session');
});

client.on('message', async message => {
    const tanggal = new Date();
    const chat = await message.getChat();
    const aboutTemplate = "encrypt0r-bot v.0.69-dev\nBot ini dikembangkan oleh encrypt0r (https://s.id/encrypt0r) dengan menggunakan library wwebjs (https://wwebjs.dev). Mohon maaf jika Bot belum bisa Uptime selama 24/7 karena masih dalam tahap pengembangan.\nTerimakasih sudah menggunakan Bot ini, jika menurut anda Bot ini bermanfaat, mohon pertimbangan untuk mensupport di https://saweria.co/encrypt0r";

    let msgx = message.body
    if (msgx.indexOf('!') > -1) {
        console.log("[*] " + message.from + " =[ " + tanggal.toLocaleString() + " ]==> " + message.body);
    }

    // check if message from groupchat
    if (chat.isGroup) {
        const authorId = message.author;
        const existingParticipants = new Set(chat.participants.map(participant => participant.id.user));
        for (let participant of chat.participants) {
            if (participant.id._serialized === authorId && participant.isAdmin) {
                if (msgx === '!help') {
                    message.reply('Halo Admin, Terimakasih sudah menggunakan chatbot ini.\nBerikut ini adalah menu Bot yang dapat anda gunakan sebagai Admin Group:  \n!help \n!about \n!halo \n!tagsemua [pesan] \n!add [nomor1],[nomor2],.. \n!kick @member1 @member2 .. \n\nSilahkan ketik !help di Private Chat untuk melihat menu yang dapat digunakan oleh User');
                }

                if (msgx.indexOf('!add') > -1) {
                    try {
                        let arrNomor = msgx.split(/\D+/).filter(Boolean);
                        let nmr = [];
                        let gagal = [];
                        let udahDiGroup = [];
                        for (let xyz of arrNomor) {
                            if (existingParticipants.has(xyz)) {
                                console.log("[!] " + xyz + " is already a participant in the group!");
                                udahDiGroup.push(xyz);
                            } else {
                                existingParticipants.add(xyz);
                                if (await client.isRegisteredUser(xyz + "@c.us")) {
                                    const contact = await client.getContactById(xyz + "@c.us");
                                    const idnmr = contact.id._serialized;
                                    nmr.push(idnmr);
                                } else {
                                    console.log("[!] " + xyz + " is not a registered user!");
                                    gagal.push(xyz);
                                }
                            }
                        }
                        if (nmr.length > 0) {
                            await chat.addParticipants(nmr);
                        }
                        if (gagal.length > 0) {
                            message.reply("Nomor yang tidak terdaftar di Whatsapp: " + gagal);
                        }
                        if (udahDiGroup.length > 0) {
                            message.reply("Nomor yang sudah ada di Group: " + udahDiGroup);
                        }
                    } catch (error) {
                        console.error("An error occurred:", error);
                        message.reply("ERROR 500!\nAtau Bot belum dijadikan Admin");
                    }
                }

                if (msgx.indexOf('!kick') > -1) {
                    try {
                        await chat.removeParticipants(message.mentionedIds)
                    } catch (error) {
                        console.error("Not Tagged")
                        message.reply("gunakan *!kick @tagOrangnya*");
                    }
                }


            } else if (participant.id._serialized === authorId && !participant.isAdmin) {

                // Menu yang hanya bisa diakses oleh Member
                if (msgx === '!help') {
                    message.reply('Halo Member, Terimakasih sudah menggunakan chatbot ini.\nBerikut ini adalah menu Bot yang dapat anda gunakan sebagai Member Group:  \n!help \n!about \n!halo \n!tagsemua [pesan] \n\nSilahkan ketik !help di Private Chat untuk melihat menu yang dapat digunakan oleh User');
                }



                // Error Catcher
                if (msgx === '!stickerize') {
                    message.reply("Maaf, konversi ke Sticker hanya dapat dilakukan melalui Private Chat")
                }
                if (msgx.indexOf('!add') > -1) {
                    message.reply("Maaf, anda bukan Admin di Group ini")
                }
                if (msgx.indexOf('!kick') > -1) {
                    message.reply("Maaf, anda bukan Admin di Group ini")
                }

            }
        }

        // Menu manajemen Group ada disini (Selain Admin)

        if (msgx.indexOf('!tagsemua') > -1) {
            let text = msgx.slice(10) + "\n";
            let mentions = [];

            for (let participant of chat.participants) {
                const contact = await client.getContactById(participant.id._serialized);
                mentions.push(contact);
                text += `@${participant.id.user} `;
            }

            await chat.sendMessage(text, { mentions });
        }

    }
    else if (!chat.isGroup) {
        // Menu yang hanya bisa diakses melalui Private Chat
        if (msgx === '!help') {
            message.reply('Halo User, Terimakasih sudah menggunakan chatbot ini.\nBerikut ini adalah menu Bot yang dapat anda gunakan didalam Private Chat: \n!help \n!about \n!stickerize \n!halo \n\nUntuk menggunakan menu Manajemen Groupchat, tambahkan bot ke dalam Group, dan jadikan sebagai Admin Group');
        }

        if (msgx === '!stickerize') {
            if (message.hasMedia) {
                const sticker = await message.downloadMedia();
                chat.sendMessage(sticker, { sendMediaAsSticker: true, stickerAuthor: 'encrypt0r-bot', stickerName: 'sticker' });
            } else {
                message.reply("Kirim gambar dengan caption *!stickerize* untuk menggunakan fitur ini")
            }
        }



        // Error Catcher
        if (msgx.indexOf('!tagsemua') > -1) {
            message.reply("Maaf, perintah ini hanya dapat digunakan di Group Chat")
        }
        if (msgx.indexOf('!add') > -1) {
            message.reply("Maaf, perintah ini hanya dapat digunakan di Group Chat")
        }
        if (msgx.indexOf('!kick') > -1) {
            message.reply("Maaf, perintah ini hanya dapat digunakan di Group Chat")
        }
    }

    // Menu yang bisa diakses semua ada disini

    if (msgx === '!halo') {
        if (tanggal.getHours() < 12) {
            message.reply('Hai Haloooo, Selamat Pagi.\nSemoga diberikan kemudahan untuk memulai hari :3');
        } else if (tanggal.getHours() < 16) {
            message.reply('Hai Haloooo, Selamat Siang.\nJangan lupa makan siang ya :)');
        } else if (tanggal.getHours() < 19) {
            message.reply('Hai Haloooo, Selamat Sore.\nTetap Semangat kak!');
        } else {
            message.reply('Hai Haloooo, Selamat Malam.\nAda cerita apa hari ini? Jangan lupa istirahat yaa');
        }
    }

    if (msgx === '!about') {
        message.reply(aboutTemplate);
    }








    // Playground



});

client.initialize();
