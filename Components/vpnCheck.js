const fetch = require('node-fetch')
const ejs = require("ejs");
const { renderFile } = require('ejs')
let newsettings = JSON.parse(require("fs").readFileSync("./settings.json"));

module.exports = (key, db, ip, res) => {
    return new Promise(async resolve => {
        let ipcache = await db.get(`vpncheckcache-${ip}`)
        if (!ipcache) {
            vpncheck = await(await fetch(`https://proxycheck.io/v2/${ip}?key=${key}&vpn=1`)).json().catch(() => { })
        }
        if (ipcache || (vpncheck && vpncheck[ip])) {
            if (!ipcache) ipcache = vpncheck[ip].proxy
            await db.set(`vpncheckcache-${ip}`, ipcache, 172800000)
            // Is a VPN/proxy?
            if (ipcache === "yes") {
                resolve(true)
                renderFile(
                    `./Public/${newsettings.defaulttheme}/alerts/vpn.ejs`,
                    {
                        settings: newsettings,
                        db,
                        extra: { home: { name: 'VPN Detected' } }
                    },
                    null,
                    (err, str) => {
                        if (err) {
                            renderFile(`./Public/legacy/alerts/vpn.ejs`, (err,str) => {
                                if(err) {
                                    console.error(err);
                                } else {
                                    res.send(str);
                                }
                            });
                        } else {
                            res.send(str);
                        }
                    }
                );
                return 
            } else return resolve(false)
        } else return resolve(false)
    })
}
