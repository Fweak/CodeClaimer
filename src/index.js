const { default: { post } } = require('axios');
const { Client } = require('discord.js');
const { readFileSync } = require('fs');
const { safeLoad } = require('js-yaml');
const Chalk = require('chalk');

process.title = 'CodeClaimer - fweak';

const tokens = readFileSync('./src/tokens.txt', 'utf-8').split('\n');
const config = safeLoad(readFileSync('./src/config.yaml'));

for (var x = 0; x < tokens.length; ++x) {
    const token = tokens[x].trim();

    const client = new Client({
        fetchAllMembers: false,
        messageCacheMaxSize: 100
    });

    client.rest.userAgentManager.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36';
    client.options.ws.properties = {
        $os: process ? process.platform : 'Discord Android',
        $browser: 'Discord Android',
        $device: 'Discord Android',
        $referrer: '',
        $referring_domain: '',
    };

    client.once('ready', () => {
        console.log(`
        ${Chalk.cyanBright('============================')}
        ${Chalk.redBright('User') + `| ${client.user.tag}`}
        ${Chalk.redBright('Id') + `| ${client.user.id}`}
        ${Chalk.redBright('Servers') + `| ${client.guilds.size}`}
        ${Chalk.cyanBright('============================')}
        `)
    });

    client.on('message', (message) => {
        var inviteChecker = message.content.match(/(discord.gg|discord.com\/invite)\/\w+/gi);
        var nitroChecker = message.content.match(/(discord.gift|discord.com\/gifts)\/\w{16,25}/gi);

        if (inviteChecker && config.j4j) joinServer(inviteChecker[0].split('/').pop(), token);
        if (nitroChecker) redeemNitro(nitroChecker[0].split('/').pop(), message.channel.id, new Date());
    });


    client.login(token)
        .catch(() => { });
}


async function joinServer(code, token) {
    const request = await post(`https://discord.com/api/v8/invites/${code}`,
        {
            headers: {
                'Authorization': token,
                'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg3LjAuMC4wIFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiI4Ny4wLjAuMCIsIm9zX3ZlcnNpb24iOiIxMCIsInJlZmVycmVyIjoiIiwicmVmZXJyaW5nX2RvbWFpbiI6IiIsInJlZmVycmVyX2N1cnJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo3MzgwMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
            }
        }
    ).catch(() => { });

    if (request && request.status === 204) return console.log(`${chalk.green('Joined Server')} ${code}`);

    return console.log(`${Chalk.redBright("INVALID")} ${code} - Invalid Server Code`);
}

async function redeemNitro(code, channelId, startTime) {
    const request = await post(`https://discord.com/api/v8/entitlements/gift-codes/${code}/redeem`,
        {
            channel_id: channelId,
            payment_source_id: null
        },
        {
            headers: {
                'Authorization': config.token,
                'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg3LjAuMC4wIFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiI4Ny4wLjAuMCIsIm9zX3ZlcnNpb24iOiIxMCIsInJlZmVycmVyIjoiIiwicmVmZXJyaW5nX2RvbWFpbiI6IiIsInJlZmVycmVyX2N1cnJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo3MzgwMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
                'Content-Type': 'application/json'
            }
        }
    ).catch(() => { });

    if (request && request.status < 400) return console.log(`${chalk.green("CLAIMED")} ${code} : .${(new Date() - startTime)}ms`);

    return console.log(`${Chalk.redBright("INVALID")} ${code} - Invalid Gift Code : .${(new Date() - startTime)}ms`);
};
