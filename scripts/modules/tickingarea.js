import { Dimension, world } from "@minecraft/server";

/**
 * @typedef {Object} Area 
 * @property {string} id - UUID
 * @property {string} dimensionId - 対象ディメンションのID
 */

export class TickingArea {
    /**
     * Ticking Areaを生成します
     * @param {Dimension} dimension 
     * @param {Object} location 
     * @param {import("@minecraft/server").Vector3} location.pos1
     * @param {import("@minecraft/server").Vector3?} location.pos2 
     * @param {number?} radius
     * @returns {Promise<Area | undefined>}
     */
    static async createArea(dimension, location, radius = 2) {
        const { pos1, pos2 } = location;

        if (!pos1 || typeof pos1 !== "object" || !("x" in pos1 && "y" in pos1 && "z" in pos1)) {
            throw new Error("Invalid pos1 format. Must contain x, y, z.");
        }

        const id = generateUUIDv4();

        let area = {
            id,
            dimensionId: dimension.id
        };

        try {
            if (pos1 && pos2) {
                const result = await dimension.runCommandAsync(
                    `tickingarea add ${pos1.x} ${pos1.y} ${pos1.z} ${pos2.x} ${pos2.y} ${pos2.z} ${id} true`
                );

                if (result.successCount > 0) {
                    return area;
                }
            } else if (pos1 && !pos2) {
                const result = await dimension.runCommandAsync(
                    `tickingarea add circle ${pos1.x} ${pos1.y} ${pos1.z} ${radius} ${id} true`
                );

                if (result.successCount > 0) {
                    return area;
                }
            }
        } catch (error) {
            console.error("Error creating Ticking Area:", error);
        }

        return undefined;
    }

    /**
     * Ticking Areaを削除します
     * @param {Area} area 
     * @returns {Promise<Boolean>}
     */
    static async removeArea(area) {
        const { id, dimensionId } = area;
        const dimension = world.getDimension(dimensionId);

        try {
            const result = await dimension.runCommandAsync(`tickingarea remove ${id}`);
            return result.successCount > 0;
        } catch (error) {
            console.error("Error removing Ticking Area:", error);
            return false;
        }
    }
}

/**
 * UUIDを生成
 * @returns {string}
 */
function generateUUIDv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}