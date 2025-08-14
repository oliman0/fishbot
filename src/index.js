import fs from "node:fs";
import path from "node:path";
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import config from "../config.json" with { type: "json" };
import { DbClient } from "./user.js";
import { Fisher } from "./fisher.js";

const __dirname = import.meta.dirname;

const client = new Client({ intents: [ GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages ] });
client.commands = new Collection();

const db = new DbClient(dbURL);
await db.connect(config.mongoURL);

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

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isCommand) return;

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