import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../../db/connectDB';
import { User } from '../models/user.model';
import { Note } from '../models/note.model';
import { TreeNode } from '../models/treeNode.model';
import bcrypt from 'bcrypt';

dotenv.config();

(async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // clear old data
    await User.deleteMany({});
    await Note.deleteMany({});
    await TreeNode.deleteMany({});
    console.log('🧹 Cleared existing data');

    // create demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'user@test.com',
      password: hashedPassword,
      subscription: 'free',
      kdfSalt: 'demo_salt',
      isVerified: true,
    });

    // create some notes
    const note1 = await Note.create({
      userId: demoUser._id,
      title: 'Note 1',
      encryptedContent: 'VGhpcyBpcyBub3RlIDE=',
    });

    const note2 = await Note.create({
      userId: demoUser._id,
      title: 'Note 2',
      encryptedContent: 'VGhpcyBpcyBub3RlIDI=',
    });

    const note3 = await Note.create({
      userId: demoUser._id,
      title: 'Note 3',
      encryptedContent: 'VGhpcyBpcyBub3RlIDM=',
    });

    const note4 = await Note.create({
      userId: demoUser._id,
      title: 'Note 4',
      encryptedContent: 'VGhpcyBpcyBub3RlIDQ=',
    });

    // Root folder
    const root = await TreeNode.create({
      userId: demoUser._id,
      title: 'Root',
      type: 'folder',
      position: 0,
      parentId: null,
    });

    // Folder A inside Root
    const folderA = await TreeNode.create({
      userId: demoUser._id,
      title: 'Folder A',
      type: 'folder',
      position: 1,
      parentId: root._id,
    });

    // File 1 inside Folder A
    await TreeNode.create({
      userId: demoUser._id,
      title: 'File 1',
      type: 'file',
      position: 0,
      parentId: folderA._id,
      fileId: note1._id,
    });

    // File 2 inside Folder A
    await TreeNode.create({
      userId: demoUser._id,
      title: 'File 2',
      type: 'file',
      position: 1,
      parentId: folderA._id,
      fileId: note2._id,
    });

    // Folder A1 inside Folder A
    const folderA1 = await TreeNode.create({
      userId: demoUser._id,
      title: 'Folder A1',
      type: 'folder',
      position: 2, // after File 1 and File 2
      parentId: folderA._id,
    });

    // File A1-1 inside Folder A1
    const noteA11 = await Note.create({
      userId: demoUser._id,
      title: 'Note A1-1',
      encryptedContent: 'Tm90ZSBmcm9tIEZvbGRlciBBMS0x',
    });

    await TreeNode.create({
      userId: demoUser._id,
      title: 'File A1-1',
      type: 'file',
      position: 0,
      parentId: folderA1._id,
      fileId: noteA11._id,
    });

    // File A1-2 inside Folder A1
    const noteA12 = await Note.create({
      userId: demoUser._id,
      title: 'Note A1-2',
      encryptedContent: 'Tm90ZSBmcm9tIEZvbGRlciBBMS0y',
    });

    await TreeNode.create({
      userId: demoUser._id,
      title: 'File A1-2',
      type: 'file',
      position: 1,
      parentId: folderA1._id,
      fileId: noteA12._id,
    });

    // Folder B inside Root
    const folderB = await TreeNode.create({
      userId: demoUser._id,
      title: 'Folder B',
      type: 'folder',
      position: 2,
      parentId: root._id,
    });

    // File 3 inside Folder B
    await TreeNode.create({
      userId: demoUser._id,
      title: 'File 3',
      type: 'file',
      position: 0,
      parentId: folderB._id,
      fileId: note3._id,
    });

    // File 4 directly under Root
    await TreeNode.create({
      userId: demoUser._id,
      title: 'File 4',
      type: 'file',
      position: 3,
      parentId: root._id,
      fileId: note4._id,
    });

    // Standalone folder (not under Root)
    await TreeNode.create({
      userId: demoUser._id,
      title: 'Standalone Folder',
      type: 'folder',
      position: 0,
      parentId: null,
    });

    // Standalone file (not under Root)
    const standaloneNote = await Note.create({
      userId: demoUser._id,
      title: 'Standalone Note',
      encryptedContent: 'VGhpcyBpcyBhIHN0YW5kYWxvbmUgbm90ZQ==',
    });

    await TreeNode.create({
      userId: demoUser._id,
      title: 'Standalone File',
      type: 'file',
      position: 1,
      parentId: null,
      fileId: standaloneNote._id,
    });

    // Archived file
    const archivedNote = await Note.create({
      userId: demoUser._id,
      title: 'Archived Note',
      encryptedContent: 'QXJjaGl2ZWQgbm90ZQ==',
    });

    await TreeNode.create({
      userId: demoUser._id,
      title: 'Archived File',
      type: 'file',
      position: 2,
      parentId: folderA._id, // put inside Folder A for variety
      fileId: archivedNote._id,
      isArchived: true,
    });

    // Deleted file
    const deletedNote = await Note.create({
      userId: demoUser._id,
      title: 'Deleted Note',
      encryptedContent: 'RGVsZXRlZCBub3Rl',
    });

    await TreeNode.create({
      userId: demoUser._id,
      title: 'Deleted File',
      type: 'file',
      position: 4,
      parentId: root._id, // directly under Root
      fileId: deletedNote._id,
      isDeleted: true,
    });

    // Archived folder
    await TreeNode.create({
      userId: demoUser._id,
      title: 'Archived Folder',
      type: 'folder',
      position: 5,
      parentId: root._id,
      isArchived: true,
    });

    // Deleted folder
    await TreeNode.create({
      userId: demoUser._id,
      title: 'Deleted Folder',
      type: 'folder',
      position: 6,
      parentId: null,
      isDeleted: true,
    });

    console.log('🌱 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
