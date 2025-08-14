import fs from "node:fs";
import path from "node:path";
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import config from "../config.json" with { type: "json" };
import { DbClient } from "./user.js";
import { Fisher } from "./fisher.js";

const __dirname = import.meta.dirname;

const client = new Client({ intents: [ GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages ] });
client.commands = new Collection();
client.buttons = new Collection();
client.selects = new Collection();

const db = new DbClient(config.mongoURL);
await db.connect();

const fisher = new Fisher();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = (await import(`file://${filePath}`)).command;
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const buttonsPath = path.join(__dirname, "buttons");
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
for (const file of buttonFiles) {
	const filePath = path.join(buttonsPath, file);
	const button = (await import(`file://${filePath}`)).button;
	// Set a new item in the Collection with the key as the button name and the value as the exported module
	if ('data' in button && 'execute' in button) {
		client.buttons.set(button.data.name, button);
	} else {
		console.log(`[WARNING] The button at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const selectsPath = path.join(__dirname, "selects");
const selectFiles = fs.readdirSync(selectsPath).filter(file => file.endsWith('.js'));
for (const file of selectFiles) {
	const filePath = path.join(selectsPath, file);
	const select = (await import(`file://${filePath}`)).select;
	// Set a new item in the Collection with the key as the select name and the value as the exported module
	if ('data' in select && 'execute' in select) {
		client.selects.set(select.data.name, select);
	} else {
		console.log(`[WARNING] The select at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction, db, fisher);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	}
	else if (interaction.isButton()) {
		const button = interaction.client.buttons.get(interaction.customId);

		if (!button) {
			console.error(`No button matching ${interaction.customId} was found.`);
			return;
		}

		try {
			await button.execute(interaction, db, fisher);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this button interaction!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this button interaction!', flags: MessageFlags.Ephemeral });
			}
		}
	}
	else if (interaction.isStringSelectMenu()) {
		const select = interaction.client.selects.get(interaction.customId);

		if (!select) {
			console.error(`No select matching ${interaction.customId} was found.`);
			return;
		}

		try {
			await select.execute(interaction, db, fisher);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this select interaction!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this select interaction!', flags: MessageFlags.Ephemeral });
			}
		}
	}
});

client.login(config.token);

process.on("exit", (code) => {
	db.close();
	client.destroy();
	console.log("Exitting...", code);
});

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT" );
    process.exit();
});