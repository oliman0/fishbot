import fs from 'node:fs';

export function GenerateTravelLocationChoices() {
    const fishdb = JSON.parse(fs.readFileSync('src/data/fish.json', 'utf-8'));
    const res = [];

    fishdb.forEach((location, index) => {
        res.push({ name: `${location.name} (Level ${location.level_required})`, value: index });
    });

    return res;
}