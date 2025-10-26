"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
function validateEnv(env) {
    const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME', 'PORT'];
    for (const k of required)
        if (!env[k])
            throw new Error(`Missing env: ${k}`);
}
//# sourceMappingURL=env.validation.js.map