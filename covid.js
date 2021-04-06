const fetch = require('node-fetch');
const { IncomingWebhook } = require('@slack/webhook');
const url = 'YOUR_SLACK_WEBHOOK_URL_HERE';
const webhook = new IncomingWebhook(url);

let lastTime;

const checkNewTime = async () => {
    const resp = await fetch('https://hudsoncovidvax.org/second/appt/109980', {
        headers: {
            accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            cookie: 'GET_COOKIES_FROM_BROWSER'
        },
        referrer: 'https://hudsoncovidvax.org/member/list?sortAsc=true',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors'
    });
    const body = await resp.text();
    const initialData = JSON.parse(
        body
            .match(/wire:initial-data="([^"]+)"/g)[1]
            .replace('wire:initial-data="', '')
            .replace('"', '')
            .replace(/&quot;/g, '"')
            .replace('\\', '\\\\')
    );
    const date = initialData.serverMemo.data.dropdownDate[0];
    const newTimes = initialData.serverMemo.data.timeSelectArr;
    const newTime = newTimes[0];
    const text = `${newTimes.length} appointments, starting @${newTime} on ${date}`;
    console.log(text);
    if (lastTime != newTime) {
        lastTime = newTime;
        await webhook.send({ text });
    }
};

setInterval(checkNewTime, 60000);
