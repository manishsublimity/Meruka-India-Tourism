# Putting the website on a server

Everything the website needs is in this git repository: the code, the website's text and photos, and the admin panel's
content (`database/meruka-content.json`). The server only needs **Node.js 18 or newer** and **MySQL 5.7+ or MariaDB
10.3+**. The website makes its database, its tables and fills them by itself on the first start.

## First time

1. Get the code:

   ```
   git clone -b Production https://github.com/manishsublimity/Meruka-India-Tourism.git
   cd Meruka-India-Tourism
   npm install --omit=dev
   ```

2. Make the settings file: copy `.env.example` to `.env` and fill in the admin login and the MySQL login:

   ```
   ADMIN_USER=admin
   ADMIN_PASSWORD=a-long-password
   SESSION_SECRET=long-random-text-at-least-32-characters
   PORT=3000

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=meruka_user
   DB_PASSWORD=the-mysql-password
   DB_NAME=meruka_cms
   ```

   Do **not** put `DB_SNAPSHOT=on` on the server.

3. Start it:

   ```
   npm start
   ```

   (or keep it running with `pm2 start server.js --name meruka` — one copy only, not cluster mode).

   On the first start it prints:

   ```
   [db] first start: filling the new database from database/meruka-content.json…
   [db] filled: … cms_edits, … cms_revisions, … uploads
   [db] MySQL ready: …
   Meruka India Tourism running at http://localhost:3000
   ```

   That is all: the database `meruka_cms` and its tables now exist and hold the same content as the computer it came
   from. Open `/admin` and log in with `ADMIN_USER` / `ADMIN_PASSWORD`.

### If the MySQL user may not create a database (shared hosting, cPanel)

Make the database once in the hosting panel (cPanel → **MySQL Databases**): create `meruka_cms`, create the user, add the
user to the database with **ALL PRIVILEGES**. Put those names in `.env` and start again — the tables and the content
come by themselves. The site says so in its log:
`[db] Could not make the database "meruka_cms" … Make it in the hosting panel …`

### If big photos do not load

MySQL must take packets of 16 MB or more for the photos. The site asks for 64 MB by itself; when it may not, add this to
MySQL's `my.cnf` (`my.ini` on Windows) under `[mysqld]` and restart MySQL:

```
max_allowed_packet=64M
```

then put the content in again: `npm run db:seed -- --yes`.

## Every update after that

```
git pull
npm install --omit=dev
pm2 restart meruka        (or stop and npm start again)
```

`git pull` never stops on content files: the live server does not write any file that is in git. The content edited
in the live admin panel stays in the live database; a pull never overwrites it.

## Moving content from the office computer to the live site

The computer where content is written has `DB_SNAPSHOT=on` in its `.env`. Every save in its admin panel updates
`database/meruka-content.json` by itself. Commit and push it with the code. A **new** server takes it on its first
start. A live server that already has content keeps its own — to replace it with the content in git (users, enquiries
and the activity log stay):

```
npm run db:seed -- --yes
pm2 restart meruka
```

## Commands

| Command | What it does |
|---|---|
| `npm start` | starts the website (makes and fills the database the first time) |
| `npm run db:export` | writes this database's content into `database/meruka-content.json` |
| `npm run db:seed -- --yes` | replaces this database's content with `database/meruka-content.json` |

## Back-ups

The live database holds everything the panel saves on the server, including the enquiries:
`mysqldump meruka_cms > backup-$(date +%F).sql` (or the hosting panel's back-up), every day.

Not in git, on purpose: the enquiries (guests' names, emails, phones), the panel's users and the activity log.
