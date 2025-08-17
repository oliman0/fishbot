import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { GenerateTravelLocationChoices } from '../deployCommandHelper.js';

const cooldownsecs = 600;

export const command = {
	data: new SlashCommandBuilder()
		.setName('travel')
		.setDescription('Travel to a fishing location.')
        .addNumberOption(option =>
                option.setName('location')
                    .setDescription('Location to travel to.')
                    .setRequired(true)
                    .addChoices(
                        GenerateTravelLocationChoices()
                    )
        )
        .setIntegrationTypes(1)
        .setContexts(0, 1, 2),
	async execute(interaction, userDB, gameManager) {
        const location = interaction.options.getNumber('location');

        if (!(await userDB.exists(interaction.user.id))) await userDB.addUser(interaction.user.id);
        const user = await userDB.getUser(interaction.user.id);

        if (Date.now() < user.last_traveled+(cooldownsecs*1000)) {
            const cooldownGif = new AttachmentBuilder('./res/cooldown.gif');

            let embed = new EmbedBuilder()
            .setAuthor({
                name: 'Oops',
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle(`***${interaction.user.displayName}*** try again in ${Math.floor((user.last_traveled+(cooldownsecs*1000) - Date.now())/1000)} seconds 3:`)
            .setImage('attachment://cooldown.gif')
            .setFooter({ text: `Lvl${user.level}  |  ${gameManager.fishData[user.location].name}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

            await interaction.reply({ embeds: [embed], files: [cooldownGif] });
            
            return;
        }

        if (user.level < gameManager.fishData[user.location].level_required) {
            const levelTooLowGif = new AttachmentBuilder('./res/notlevel.gif');

            let embed = new EmbedBuilder()
            .setAuthor({
                name: 'Travel',
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle(`***${interaction.user.displayName}*** you need to be **lvl ${gameManager.fishData[user.location].level_required}** to visit the **${gameManager.fishData[user.location].name}**`)
            .setImage('attachment://notlevel.gif')
            .setFooter({ text: `Lvl${user.level}  |  ${gameManager.fishData[user.location].name}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

            await interaction.reply({ embeds: [embed], files: [levelTooLowGif] });
            
            return;
        }

        if (user.location == location) {
            let embed = new EmbedBuilder()
            .setAuthor({
                name: 'Travel',
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle(`***${interaction.user.displayName}*** you're already at the **${gameManager.fishData[user.location].name}** :P`)
            .setFooter({ text: `Lvl${user.level}  |  ${gameManager.fishData[user.location].name}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

            await interaction.reply({ embeds: [embed], files: [] });
            
            return;
        }
        
        await userDB.editUser(interaction.user.id, { location: location, last_traveled: Date.now() });

        const travelGifName = `travel${Math.floor(Math.random()*4)}.gif`;
        const travelGif = new AttachmentBuilder(`./res/${travelGifName}`);

        let embed = new EmbedBuilder()
            .setAuthor({
                name: 'Travel',
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle(`***${interaction.user.displayName}*** is traveling to the **${gameManager.fishData[user.location].name}**`)
            .setImage(`attachment://${travelGifName}`)
            .setFooter({ text: `Lvl${user.level}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], files: [travelGif] });
	},
};