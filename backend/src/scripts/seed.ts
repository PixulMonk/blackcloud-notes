/**
 * BlackCloud Notes - Seed File
 * Password: Password_123
 *
 * Replicates the exact client-side crypto chain:
 * 1. Argon2id(password, salt) → 64 bytes → KEK (0-31) | authToken (32-63)
 * 2. bcrypt(authToken) → hashedAuthToken (stored on User)
 * 3. crypto.randomBytes(32) → DEK
 * 4. AES-256-GCM(DEK, KEK) → protectedDEK (stored on User)
 * 5. AES-256-GCM(title, DEK) → encryptedTitle (stored on TreeNode)
 * 6. AES-256-GCM(content, DEK) → encryptedContent (stored on Note)
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { argon2id } from 'hash-wasm';

import { User } from '../models/user.model';
import { TreeNode } from '../models/treeNode.model';
import { Note } from '../models/note.model';
import { connectDB } from '../../db/connectDB';

dotenv.config();

// ─── Config (must match ENCRYPTION_CONFIG exactly) ───────────────────────────

const ARGON2_PARAMS = {
  memoryCost: 65536,
  timeCost: 2,
  parallelism: 4,
  hashLength: 64,
  type: 'argon2id' as const,
};

const SCHEMA_VERSION = 1;
const PASSWORD = 'Password_123';
const SEED_EMAIL = 'user@test.com';
const SEED_NAME = 'Test User 1';

// ─── Crypto Helpers ───────────────────────────────────────────────────────────

/**
 * Mirrors the frontend's encryptAESGCM — produces IV ‖ ciphertext ‖ tag as base64
 */
function encryptAESGCM(plaintext: Buffer | string, keyBytes: Buffer): string {
  const iv = crypto.randomBytes(12); // 96-bit IV
  const data =
    typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf8') : plaintext;

  const cipher = crypto.createCipheriv('aes-256-gcm', keyBytes, iv);
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag(); // 16 bytes

  // IV ‖ ciphertext ‖ tag — matches frontend layout
  return Buffer.concat([iv, ciphertext, tag]).toString('base64');
}

/**
 * Mirrors deriveKeysForNewUser — Argon2id → KEK + authToken
 */
async function deriveKeys(
  password: string,
  salt: Buffer,
): Promise<{ kek: Buffer; authToken: Buffer }> {
  const derived = await argon2id({
    password,
    salt,
    parallelism: ARGON2_PARAMS.parallelism,
    iterations: ARGON2_PARAMS.timeCost,
    memorySize: ARGON2_PARAMS.memoryCost,
    hashLength: ARGON2_PARAMS.hashLength,
    outputType: 'binary',
  });

  const kek = Buffer.from(derived).subarray(0, 32);
  const authToken = Buffer.from(derived).subarray(32, 64);
  return { kek, authToken };
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

// ─── TipTap JSON Content ──────────────────────────────────────────────────────

const notes = [
  {
    title: 'The Power of Fragrance',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'The Power of Fragrance' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'When you walk into a room, you do not just enter. You ARRIVE. The sillage trails behind you like a comet. People turn. People stare. People wonder: what IS that scent?',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is the power of fragrance. This is BEAST MODE.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'My Top 3 Powerhouse Fragrances' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Sauvage by Dior',
                    },
                    {
                      type: 'text',
                      text: ' — Fresh. Powerful. A classic for a reason.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Bleu de Chanel',
                    },
                    {
                      type: 'text',
                      text: ' — Sophistication in a bottle. Undeniable.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Aventus by Creed',
                    },
                    {
                      type: 'text',
                      text: ' — The king. The legend. The GOAT.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Remember: fragrance is invisible but unforgettable. Wear it with confidence.',
            },
          ],
        },
      ],
    },
  },
  {
    title: 'Sillage & Longevity Guide',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Sillage & Longevity: The Bible' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'You asked. I answer. How do you maximize sillage? How do you make the longevity INSANE? Read carefully.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Application Points' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Pulse points — wrists, neck, chest.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Behind the ears — trap the scent, release slowly.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Inner elbows — underrated. Criminally underrated.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '"Do not rub the wrists together. You are killing the top notes. Stop it."',
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Moisturize first. Unscented lotion. Then spray. The fragrance clings to moisture. This is science. This is life.',
            },
          ],
        },
      ],
    },
  },
  {
    title: 'BlackCloud Dev Notes',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'BlackCloud Dev Notes' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Zero-knowledge architecture decisions and implementation notes.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Encryption Stack' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'code' }],
                      text: 'Argon2id',
                    },
                    {
                      type: 'text',
                      text: ' — KDF. 64-byte output. KEK = bytes 0-31, authToken = bytes 32-63.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'code' }],
                      text: 'AES-256-GCM',
                    },
                    {
                      type: 'text',
                      text: ' — All symmetric encryption. 12-byte IV, 16-byte tag.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'code' }],
                      text: 'bcrypt',
                    },
                    {
                      type: 'text',
                      text: ' — Server-side authToken hashing. Cost 12.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Key Bug Fixed' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'TreeNode component was using ',
            },
            {
              type: 'text',
              marks: [{ type: 'code' }],
              text: 'useKeyEncryptionKey()',
            },
            {
              type: 'text',
              text: ' instead of ',
            },
            {
              type: 'text',
              marks: [{ type: 'code' }],
              text: 'useDataEncryptionKey()',
            },
            {
              type: 'text',
              text: ' for rename operations. KEK ≠ DEK. Classic.',
            },
          ],
        },
      ],
    },
  },
];

// ─── Seed Structure ───────────────────────────────────────────────────────────

// Tree: 2 folders at root, notes inside
// [Folder] Fragrance Bible
//   [File]  The Power of Fragrance
//   [File]  Sillage & Longevity Guide
// [Folder] Dev Logs
//   [File]  BlackCloud Dev Notes

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await connectDB();
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Note.deleteMany({});
  await TreeNode.deleteMany({});
  console.log('🧹 Cleared existing data');

  // 1. Derive keys from password
  const salt = crypto.randomBytes(16);
  const { kek, authToken } = await deriveKeys(PASSWORD, salt);
  console.log('🔑 Keys derived');

  // 2. Generate DEK and wrap with KEK
  const dek = crypto.randomBytes(32);
  const protectedDEK = encryptAESGCM(dek, kek);
  console.log('🔐 DEK wrapped');

  // 3. Hash authToken for server storage
  const hashedAuthToken = await bcrypt.hash(
    toBase64(authToken), // match frontend's toBase64(authToken)
    12,
  );
  console.log('🔒 Auth token hashed');

  // 4. Create user
  const user = await User.create({
    name: SEED_NAME,
    email: SEED_EMAIL,
    hashedAuthToken,
    protectedDEK,
    argon2Salt: salt.toString('base64'),
    argon2Params: ARGON2_PARAMS,
    schemaVersion: SCHEMA_VERSION,
    isVerified: true,
    lastLogin: new Date(),
  });
  console.log(`👤 User created: ${SEED_EMAIL}`);

  // 5. Create folders
  const fragranceFolder = await TreeNode.create({
    userId: user._id,
    encryptedTitle: encryptAESGCM('Fragrance Bible', dek),
    type: 'folder',
    position: 0,
    schemaVersion: SCHEMA_VERSION,
  });

  const devFolder = await TreeNode.create({
    userId: user._id,
    encryptedTitle: encryptAESGCM('Dev Logs', dek),
    type: 'folder',
    position: 1,
    schemaVersion: SCHEMA_VERSION,
  });

  console.log('📁 Folders created');

  // 6. Create notes + file tree nodes
  const [note1, note2, note3] = await Promise.all(
    notes.map((n) =>
      Note.create({
        userId: user._id,
        encryptedContent: encryptAESGCM(JSON.stringify(n.content), dek),
        schemaVersion: SCHEMA_VERSION,
      }),
    ),
  );

  await TreeNode.create({
    userId: user._id,
    encryptedTitle: encryptAESGCM(notes[0].title, dek),
    type: 'file',
    position: 0,
    parentId: fragranceFolder._id,
    fileId: note1._id,
    schemaVersion: SCHEMA_VERSION,
  });

  await TreeNode.create({
    userId: user._id,
    encryptedTitle: encryptAESGCM(notes[1].title, dek),
    type: 'file',
    position: 1,
    parentId: fragranceFolder._id,
    fileId: note2._id,
    schemaVersion: SCHEMA_VERSION,
  });

  await TreeNode.create({
    userId: user._id,
    encryptedTitle: encryptAESGCM(notes[2].title, dek),
    type: 'file',
    position: 0,
    parentId: devFolder._id,
    fileId: note3._id,
    schemaVersion: SCHEMA_VERSION,
  });

  console.log('📝 Notes + file nodes created');
  console.log('');
  console.log('─────────────────────────────────────');
  console.log('✅ Seed complete!');
  console.log(`   Email:    ${SEED_EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log('─────────────────────────────────────');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
