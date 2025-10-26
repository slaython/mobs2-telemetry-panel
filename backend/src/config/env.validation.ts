export function validateEnv(env: NodeJS.ProcessEnv) {
  const required = ['DB_HOST','DB_PORT','DB_USER','DB_PASS','DB_NAME','PORT']
  for (const k of required) if (!env[k]) throw new Error(`Missing env: ${k}`)
}
