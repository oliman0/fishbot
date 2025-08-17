import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, MessageFlags, StringSelectMenuBuilder, AttachmentBuilder } from 'discord.js';

export const command = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Buy upgrades.')
        .addStringOption(option =>
            option.setName('shop')
                .setDescription('Which shop to open')
                .setRequired(true)
                .addChoices(
                    { name: 'Bait', value: 'baitshop' }
                )
        )
        .setIntegrationTypes(1)
        .setContexts(0, 1, 2),
	async execute(interaction, userDB, gameManager) {
        if (!(await userDB.exists(interaction.user.id))) await userDB.addUser(interaction.user.id);
        var user = await userDB.getUser(interaction.user.id);

        const shoptype = interaction.options.getString('shop');
        const shopGif = new AttachmentBuilder('./res/shop0.gif');

        switch (shoptype) {
            case 'baitshop':
                let embed = new EmbedBuilder()
                    .setAuthor({
                        name: 'Shop',
                        iconURL: interaction.user.displayAvatarURL()})
                    .setTitle(`***${interaction.user.displayName}*** welcome to the **Bait Shop**`)
                    .setImage(`attachment://shop0.gif`)
                    .setFooter({ text: `Lvl${user.level}  |  ${gameManager.fishData[user.location].name}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                const baitsAvailable = [];
                gameManager.itemsData.bait.forEach((bait, index) => {
                    if (bait.level_required < user.level) baitsAvailable.push({ label: bait.name, value: `${index}` });
                });

                const select = new StringSelectMenuBuilder()
                    .setCustomId('bait')
                    .setPlaceholder('Choose a bait.')
                    .addOptions(baitsAvailable);

                const row = new ActionRowBuilder()
                    .addComponents(select);

                await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral, files: [shopGif] })
                
                break;
        }

	},
};