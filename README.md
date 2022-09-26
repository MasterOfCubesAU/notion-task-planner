# Notion Task Planner
A tool to automate weekly task scheduling


## Getting Started
Ensure node.js and npm are installed. Create a Notion [integration](https://www.notion.so/my-integrations) following steps **1 and 2** in this [guide](https://developers.notion.com/docs/getting-started)

## Installation
```
git clone https://github.com/MasterOfCubesAU/notion-task-planner
cd notion-task-planner
npm ci
```

## Configuration
```yml
DATABASE_ID: This is the ID to your Notion database found in step 2 of the above guide
APP_SECRET: This is the app secret generated as part of your Notion integration
```

Tasks you would like to automate are listen in YAML format. The header `TASKS` defines all tasks. Each task is defined by a `name`, `icon` and `due` date.
The only optional parameter is `icon`. To omit an icon, specify null. (see examples)

The `due` date format is strict and follows the syntax
```
DAY_NAME HH:mm

Note that the time is presented in 24 hour format and is optional. Some examples are as follows:

Monday 15:00 => Monday 3PM
Wednesday 09:00 => Wednesday 9AM
Sunday => Sunday 12AM
```

![image](https://user-images.githubusercontent.com/38149391/192323207-10ff858a-30d7-4b84-bf87-ff8998467e99.png)
