const fs = require('fs');
const {MessageEmbed} = require('discord.js');

module.exports = {
	name: 'deletebuild',
    aliases: ["db", "deleteb", "dbuild", "removebuild"],
	description: 'Delete a specific mentor set build',
	execute(message, args, client) {
        if (args == "") { message.channel.send(new MessageEmbed().setDescription("Please Enter a build ID to delete")); return;}
        const server = client.guilds.cache.get('733765822127800391')
        const member = server.members.cache.get(message.author.id)
        const hasPerms = member ? member.roles.cache.get('895713618845384724') : false
        if (!hasPerms) {
            message.channel.send(new MessageEmbed().setDescription("You do not have permission to do this!")); 
            return;
        }
        findBuild(message, args);
	},
};

function findBuild(message, buildId) {
    let buildFound = false;
    fs.readFile('builds.json', 'utf8', (err, buildsData) => {
        if (err) {
            console.log("File read failed: ", err);
            return;
        }
        try {
            buildList = JSON.parse(buildsData);
        } catch (err) {
            console.log("error parsing json string: ", err);
            return;
        }
        buildList.forEach(build => {    
            if (build.id == buildId) {
                buildFound = true;
                buildList.splice(buildList.indexOf(build), 1);
                const data = JSON.stringify(buildList, null, 4);
                fs.writeFile('builds.json', data, (err) => {
                    if (err) {
                        throw err;
                    }
                })
                message.channel.send(new MessageEmbed().setDescription(`Build id ${build.id} deleted \nid ${build.id} was: ${build.role} ${build.god} build with items: ${build.items}`));
            }
        });
        if (!buildFound) {
            message.channel.send(new MessageEmbed().setDescription("Couldnt find a build with that id"));
        }
    });
}