export interface Argon2Params {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
  hashLength: number;
  type: 'argon2id';
}
