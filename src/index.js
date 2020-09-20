const { default: { post } } = require('axios');
const { Client } = require('discord.js');
const { readFileSync } = require('fs');
const { safeLoad } = require('js-yaml');
const Chalk = require('chalk');

let tokens = readFileSync('./src/tokens.txt', 'utf8').replace(/\r/g, '').split('\n');
let config = safeLoad(readFileSync('./src/config.yaml'));

var count = 0;
var total = 0;

process.title = 'CodeClaimer (fweak)';
for (let token of tokens) {
    const client = new Client({ fetchAllMembers: false, messageCacheMaxSize: 100 });
    client.rest.userAgentManager.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36';
    client.options.ws.properties = {
        $os: process ? process.platform : 'Discord Android',
        $browser: 'Discord Android',
        $device: 'Discord Android',
        $referrer: '',
        $referring_domain: '',
    }

    client.on('ready', () => {
        console.log(`
        ${Chalk.cyanBright('============================')}
        ${Chalk.redBright('User') + `| ${client.user.tag}`}
        ${Chalk.redBright('Id') + `| ${client.user.id}`}
        ${Chalk.redBright('Servers') + `| ${client.guilds.size}`}
        ${Chalk.cyanBright('============================')}
        `)
    });

    client.on('message', async (msg) => {
        var invites = msg.content.match(/(discord.gg|discord.com\/invite)\/\w+/gi);
        var nitros = msg.content.match(/(discord.gift|discord.com\/gifts)\/\w+/gi);
        if (config.toggles.join4join && invites && invites[0]) await joinServer(invites[0].split('/').pop(), new Date());
        if (nitros && nitros[0]) await redeemNitro(nitros[0].split('/').pop(), msg.channel.id, new Date());
    });

    try {
        client.login(token).catch(() => { })
    } catch (err) {
        continue;
    }
}

async function joinServer(code, startTime) {
    const request = post(`https://discord.com/api/v8/invites/${invite[0].split('/').pop()}`, {}, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36', 'Authorization': config.details.token } }).catch(() => { });
    if (!request || request.status >= 400) return console.log(`        ${Chalk.redBright("INVALID")} ${code} - Invalid Server Code : .${(new Date() - startTime)}ms`);
    console.log(`        ${chalk.green('Joined Server')} ${code} :. ${(new Date() - start)}ms`);
    return;
}

async function redeemNitro(code, channelId, startTime) {
    total++;
    process.title = `CodeClaimer (fweak) : ${count}/${total}`;
    const request = await post(`https://discord.com/api/v8/entitlements/gift-codes/${code}/redeem`, { channel_id: channelId, payment_source_id: null }, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36', 'Authorization': config.details.token, 'Content-Type': 'application/json' } }).catch(() => { });
    if (!request || request.status >= 400) return console.log(`        ${Chalk.redBright("INVALID")} ${code} - Invalid Gift Code : .${(new Date() - startTime)}ms`);
    console.log(`        ${chalk.green("CLAIMED")} ${code} = ${message.channel.name} : .${(new Date() - start)}ms`);
    count++;
    return;
}
