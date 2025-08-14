import { RoleFlagsBitField } from "discord.js";
import fs from "node:fs";

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const avg = (a, b) => (a + b)/2;

function randn_bm(min, max, skew) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random() //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random()
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
  
  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0) 
    num = randn_bm(min, max, skew) // resample between 0 and 1 if out of range
  
  else{
    num = Math.pow(num, skew) // Skew
    num *= max - min // Stretch to fill range
    num += min // offset to min
  }
  return num
}

const Tiers = [ "Common", "Uncommon", "Rare", "Epic", "Legendary" ];

export class Fisher {
    #fishdb

    constructor() {
        this.#fishdb = JSON.parse(fs.readFileSync("src/data/fishdata.json", "utf-8"));
    }

    fishdata() { return this.#fishdb.fish; }

    catch(locationID) {
        const fish = this.#fishdb.fish;

        var chance = Math.floor(Math.random()*fish[locationID].total_chance)+1;

        var i = -1;
        while (chance > 0) {
            i++;
            chance -= fish[locationID].catch_chances[i];
        }
        const caughtFish = fish[locationID].fish[i];

        i = -1;
        chance = Math.floor(Math.random()*caughtFish.total_chance)+1;
        while (chance > 0) {
            i++;
            chance -= caughtFish.tier_chances[i];
        }
        const tier = i;

        var weight = randn_bm(caughtFish.weight_min*100, caughtFish.weight_max*100, 1-caughtFish.weight_bias)/100;
        weight = clamp(weight, caughtFish.weight_min, caughtFish.weight_max);
        weight = Math.round(weight * 100) / 100;

        const gold = Math.ceil(caughtFish.value + (weight/caughtFish.weight_max)*caughtFish.value + tier*caughtFish.value);

        return { name: caughtFish.display_name, tier: Tiers[tier], weight: weight, gold: gold };
    }

    getLocationByID(locationID) {
        return this.#fishdb.fish[locationID];
    }

    async checkLevel(user, userDB) {
        if (user.gold < user.xp_required) return -1;

        const xpRequiredMul = this.#fishdb.level_xp_multiplier;
        var newLevel = user.level;
        var newXpRequired = user.xp_required;
        var newXpRequiredIncrease = user.xp_required_increase;

        while (user.gold >= newXpRequired) {
            newLevel += 1;
            newXpRequiredIncrease = Math.floor(newXpRequiredIncrease*xpRequiredMul);
            newXpRequired += newXpRequiredIncrease;
        }

        await userDB.editUser(user.id, { 
            level: newLevel,
            xp_required: newXpRequired,
            xp_required_increase: newXpRequiredIncrease
        });

        const lvlupText = this.#fishdb.levelup_text.find((entry) => entry.level == newLevel);

        return { level: newLevel, text: lvlupText !== undefined ? lvlupText.text : "" };
    }
}