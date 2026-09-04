# Deploy á new.blaorka.is (web1.haukdal.is)

Vefurinn keyrir sem Node.js-síða í CloudPanel (site user `blaorka-new`, port 3010),
nginx á 443 vísar á `127.0.0.1:3010`. Skrárnar hér eru afrit af því sem er á þjóninum.

## Að setja nýja útgáfu í loftið

```bash
ssh web1                 # root@web1.haukdal.is (~/.ssh/id_rsa)
deploy-new-blaorka       # sækir origin/main, byggir, skiptir yfir, endurræsir
deploy-new-blaorka mitt-branch   # eða annað branch
```

Skriptan gerir: `git reset --hard origin/<branch>` → `npm ci` → `next build` →
afritar `.next/standalone` í `~/app/releases/<tími>-<commit>` → `~/app/current` symlink →
`systemctl restart new-blaorka` → heilsutékk (fellur til baka í fyrri útgáfu ef 200 kemur ekki).

## Skráarskipan á þjóninum (`/home/blaorka-new/app`)

| Slóð          | Hlutverk                                   |
|---------------|--------------------------------------------|
| `repo/`       | git checkout + node_modules (byggingarsvæði) |
| `releases/`   | tilbúnar útgáfur, síðustu 5 geymdar          |
| `current`     | symlink á útgáfuna sem er í loftinu          |
| `shared/.env` | `HELPDESK_API_URL`, `HELPDESK_API_KEY` (600) |
| `deploy.sh`, `start.sh` | afrit af skrám í þessari möppu     |

## Gagnlegt

```bash
systemctl status new-blaorka
journalctl -u new-blaorka -f
ls -la /home/blaorka-new/app/releases        # rollback: ln -sfn <útgáfa> current && systemctl restart new-blaorka
tail -f /home/blaorka-new/logs/nginx/error.log
```

Nginx-vhost er í CloudPanel (Sites → new.blaorka.is → Vhost). Þar er bætt við
`client_max_body_size 130m` (viðhengi í samskiptaformum) og `X-Robots-Tag: noindex`
(staging á ekki að lenda í Google). Fjarlægja noindex þegar vefurinn fer á blaorka.is.
