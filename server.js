const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const serverConfig = {
    api_key: "random_api_key",
    name: "mainServer"
};

const data = {};

const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

app.get('/server/command/post:command', (req, res) => {
    const commandString = req.params.command;
    const [command, ...args] = commandString.split(':');

    if (!command) {
        return res.status(400).json({ message: 'Command is required.' });
    }

    data.command = { command, arguments: args.length > 0 ? args : null };

    fs.writeFileSync(path.join(dataDir, `${serverConfig.name}.json`), JSON.stringify(data));

    res.status(200).json({
        message: 'Command and arguments received and saved.',
        data: data.command
    });
});

app.get('/server/command', (req, res) => {
    try {
        const fileData = fs.readFileSync(path.join(dataDir, `${serverConfig.name}.json`), 'utf-8');
        const savedData = JSON.parse(fileData);
        res.json({
            command: savedData.command || "No command available."
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to read command data.' });
    }
});

app.get('/api/:api_key/:name/server/command', (req, res) => {
    const { api_key, name } = req.params;

    if (api_key === serverConfig.api_key && name === serverConfig.name) {
        if (!data.command) {
            try {
                const fileData = fs.readFileSync(path.join(dataDir, `${serverConfig.name}.json`), 'utf-8');
                Object.assign(data, JSON.parse(fileData));
            } catch (err) {
                console.log("No previous data found.");
            }
        }
        res.json({
            server: name,
            api_key: api_key,
            command: data.command || "No command available."
        });
    } else {
        res.status(403).json({ message: 'Invalid API Key or Server Name.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});