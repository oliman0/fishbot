import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';

export const command = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('View a users stats.')
        .addUserOption(option =>
			option.setName('target')
				.setDescription('User stats to view')
        )
        .setIntegrationTypes(1)
        .setContexts(0, 1, 2),
	async execute(interaction, userDB, gameManager) {
        const target = interaction.options.getUser('target') ?? interaction.user;

        if (!(await userDB.exists(target.id))) {
            const cooldownGif = new AttachmentBuilder('./res/cooldown.gif');

            let embed = new EmbedBuilder()
            .setAuthor({
                name: 'Stats',
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle('User not found 3:')
            .setImage('attachment://cooldown.gif')
            .setFooter({ text: '???', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

            await interaction.reply({ embeds: [embed], files: [cooldownGif] });
            return;
        }
        
        const user = await userDB.getUser(target.id);

        let embed = new EmbedBuilder()
            .setAuthor({
                name: 'Stats',
                iconURL: target.displayAvatarURL()})
            .setTitle(`***${target.displayName}'s*** Stats!`)
            .setDescription(`- Level: *${user.level} (${user.gold-user.xp_required+user.xp_required_increase}xp/${user.xp_required_increase}xp)*\n- Gold: *${user.gold}*\n- Catches: *${user.catches}*`)
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: gameManager.fishData[user.location].name, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], files: [] });
	},
};