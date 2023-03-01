import { CONFIG, NOTION } from "./index.js";
import moment from 'moment';

const dayToNumber = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
]

/**
 * Adds an item to a column specified by status
 * 
 * @param {string} title Card Title
 * @param {string} status Column to add card to
 * @param {string} due ISO representation of Due Date
 * @param {string} emoji Card Icon
 */
export async function addItem(title, status, due, emoji) {
    let data = {
        parent: { database_id: CONFIG.DATABASE_ID },
        properties: {
            "title": {
                title: [
                    {
                        "text": {
                            "content": title
                        }
                    }
                ]
            },
            "Status": {
                "select": {
                    "name": status
                }
            },
            "Due Date": {
                "date": {
                    "start": due,
                }
            }
        },
    }
    if (due.includes("T")) {
        data.properties["Due Date"]["date"]["time_zone"] = CONFIG.TIMEZONE
    }
    if (emoji) {
        data['icon'] = {
            "type": "emoji",
            "emoji": emoji
        }
    }

    try {
        await NOTION.pages.create(data)
    } catch (error) {
        console.error(error.body)
    }
}

/**
 * 
 * Converts generic day/time string to next occurrence in ISO format
 * 
 * @param {string} dateSTR 
 * @returns string
 */
export function createISO(dateSTR) {
    let day = dateSTR.split(" ")[0];
    let time = null;

    if (dateSTR.split(" ").length == 2) {
        time = moment(dateSTR.split(" ")[1], "HH:mm");
    }

    let nextDueDate = getNextDayOfWeek(moment(), dayToNumber.indexOf(day) + 1);
    if (time != null) {
        return moment(nextDueDate).set({
            hour: time.get('hour'),
            minute: time.get('minute'),
            second: 0
        }).add((moment(nextDueDate).utcOffset() / 60), 'hours').utc().toISOString()
    } else {
        return moment(nextDueDate).startOf('day').add((moment(nextDueDate).utcOffset() / 60), 'hours').utc().toISOString().split("T")[0];
    }
}


/**
 * Clears all tasks completed from Done category if present >= 48 hours. Moves tasks into location specified in CONFIG.ARCHIVE_LOCATION
 */
export async function clearCompletedTasks() {
    const response = await NOTION.databases.query({
        database_id: CONFIG.DATABASE_ID,
        filter: {
            property: "Status",
            select: {
                "equals": "Done"
            }
        },
    });
    for (const result of response.results) {
        if (result.properties["Due Date"]?.date != null && moment.duration(moment().tz(CONFIG.TIMEZONE).diff(moment(result.properties["Due Date"].date.start))).asHours() < 48) {
            continue;
        }
        console.log(`Moving ${result.properties["Name"].title[0].plain_text} to ${CONFIG.ARCHIVE_LOCATION}`);
        await movePageTo(result.id, CONFIG.ARCHIVE_LOCATION);
    }
}

// HELPER FUNCTIONS

/**
 * Moves page of pageID to category status.
 * @param {string} pageID 
 * @param {string} status 
 */
async function movePageTo(pageID, status) {
    await NOTION.pages.update({
        page_id: pageID,
        properties: {
            "Status": {
                "select": {
                    "name": status
                }
            }
        },
    });
}


/**
 * Given a day of the week, return the date object of the next occurrence from the date from.
 * @param {moment} from 
 * @param {string} dayOfWeek
 * @returns Date
 */
function getNextDayOfWeek(from, dayOfWeek) {
    const current = from.day()
    const days = (7 + dayOfWeek - current) % 7
    return from.clone().add(days, 'd')
}