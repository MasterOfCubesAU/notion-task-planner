import { Client } from "@notionhq/client"
import yaml from "js-yaml";
import fs from 'fs';
import moment from 'moment';
import 'moment-timezone';
import { addItem, createISO, clearCompletedTasks } from './util.js';

let CONFIG = null;
try {
    CONFIG = yaml.load(fs.readFileSync('./config.yml', 'utf8'));
} catch (e) {
    console.log(`Could not loud config: ${e}`);
}

const NOTION = new Client({ auth: CONFIG.APP_SECRET })


if (moment().tz(CONFIG.TIMEZONE).format("dddd") == CONFIG.DAY_TO_RUN) {
    for (const task of CONFIG.TASKS) {
        console.log(`Adding task: ${task.name}, ${createISO(task.due)}`);
        addItem(task.name, "To Do", createISO(task.due), task.icon)
    }
}
clearCompletedTasks();


export { CONFIG, NOTION }